import Follow from "../models/FollowModel.js";
import Validator from 'fastest-validator'
import Jwt from 'jsonwebtoken'
import User from "../models/UserModel.js";
import Like from "../models/LikeModel.js";
import Story from "../models/StoryModel.js";
import View from "../models/ViewModel.js";
import { getSession } from "../utils/session.js";

const v = new Validator()

export const createStory = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const schema = {
                    caption: "string",
                    imageUrl: "string",
                }

                const validate = v.validate(req.body, schema)

                if (validate.length) {
                    return res.status(400).json({ code: "400", status: "BAD_REQUEST", errors: validate })
                }

                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setHours(today.getHours() + 24);

                await Story.create({
                    userId: decoded.userId,
                    caption: req.body.caption,
                    imageUrl: req.body.imageUrl,
                    expiredAt: tomorrow
                })
                res.status(200).json({ code: "200", status: "OK", message: "Story Created" })
            } else {
                res.status(401).json({
                    code: "401",
                    status: "UNAUTHORIZED",
                    message: 'Unauthorized'
                });
            }
        }


    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })

    }
}

export const deleteStory = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const storyId = req.params.id
                const story = await Story.findOne({
                    where: {
                        id: storyId
                    },
                    raw: true
                })

                if (!story) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'Story not found'
                    });
                }

                if (story.userId !== decoded.userId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You only can delete your own story"
                    });
                }

                await Story.destroy({
                    where: {
                        id: storyId
                    }
                })

                res.status(200).json({ code: "200", status: "OK", message: "Story Deleted" })
            } else {
                res.status(401).json({
                    code: "401",
                    status: "UNAUTHORIZED",
                    message: 'Unauthorized'
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })

    }
}

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = 0 + (page - 1) * limit

    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: stories } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, stories, totalPages, currentPage };
};

const addView = async ({ userId, referenceId, storyUserId }) => {
    if (userId === storyUserId) return;

    const view = await View.findOne({
        where: { userId, referenceId, }
    })

    if (!view) {
        await View.create({ userId, referenceId, })
    }
}

export const getStoryById = async (req, res) => {
    try {
        const { decoded } = await getSession(req)

        const { id } = req.params

        const storyResponse = await Story.findOne({
            raw: true,
            where: {
                id,
            },
        })

        if (!storyResponse) {
            return res.status(404).json({
                code: "404",
                status: "NOT_FOUND",
                message: 'Story not found'
            });
        }

        const userResponse = await User.findOne({ where: { id: storyResponse.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

        const story = {
            id: storyResponse.id,
            userId: storyResponse.userId,
            imageUrl: storyResponse.imageUrl,
            caption: storyResponse.caption,
            user: userResponse,
            expiredAt: storyResponse.expiredAt,
            createdAt: storyResponse.createdAt,
            updatedAt: storyResponse.updatedAt
        }

        await addView({
            userId: decoded.userId,
            referenceId: storyResponse.id,
            storyUserId: storyResponse.userId
        })

        return res.status(200).json({
            code: "200",
            status: "OK",
            message: "Success",
            data: story,
        });
    } catch (error) {
        return res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}

export const getViewsByStoryId = async (req, res) => {
    try {
        const { id } = req.params

        const views = await View.findAll({
            where: {
                referenceId: id,
            },
            include: [{ model: User, attributes: ['id', 'name', 'username', 'profilePictureUrl'] }],
            attributes: ['id']
        })

        return res.status(200).json({
            code: "200",
            status: "OK",
            message: "Success",
            data: views,
        });
    } catch (error) {
        return res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}

const getMyFollowingUserId = async (userId) => {
    const userIds = []
    await Follow.findAll({ where: { userId: userId }, raw: true }).then((data) => {
        for (const follow of data) {
            userIds.push(follow.userIdFollow)
        }
    })
    return userIds
}

export const getMyFollowingStories = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const userIds = await getMyFollowingUserId(decoded.userId)

                let storyArray = []
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Story.count({
                    where: {
                        userId: userIds,
                    },
                });

                await Story.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userId: userIds,
                    },
                }).then(async (data) => {
                    for await (const story of data) {
                        const totalViews = await View.count({ where: { referenceId: story.id } })
                        const user = await User.findOne({ where: { id: story.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        storyArray.push({
                            id: story.id,
                            userId: story.userId,
                            imageUrl: story.imageUrl,
                            caption: story.caption,
                            totalViews,
                            user: user,
                            createdAt: story.createdAt,
                            updatedAt: story.updatedAt
                        })
                    }
                });

                const data = getPagingData({ count: total, rows: storyArray }, page, limit);

                return res.status(200).json({
                    code: "200",
                    status: "OK",
                    message: "Success",
                    data: data,
                });
            } else {
                res.status(401).json({
                    code: "401",
                    status: "UNAUTHORIZED",
                    message: 'Unauthorized'
                });
            }
        }

    } catch (error) {
        return res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}