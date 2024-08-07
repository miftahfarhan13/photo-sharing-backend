import Post from "../models/PostModel.js";
import Follow from "../models/FollowModel.js";
import Comment from "../models/CommentModel.js";
import Validator from 'fastest-validator'
import Jwt from 'jsonwebtoken'
import User from "../models/UserModel.js";
import { Sequelize } from "sequelize";
import Like from "../models/LikeModel.js";

const v = new Validator()

export const createPost = async (req, res) => {
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

                await Post.create({
                    userId: decoded.userId,
                    caption: req.body.caption,
                    imageUrl: req.body.imageUrl,
                })
                res.status(200).json({ code: "200", status: "OK", message: "Post Created" })
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

export const updatePost = async (req, res) => {
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

                const postId = req.params.id
                const post = await Post.findOne({
                    where: {
                        id: postId
                    },
                    raw: true
                })

                if (!post) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'Post not found'
                    });
                }

                if (post.userId !== decoded.userId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You only can update your own post"
                    });
                }

                await Post.update({
                    caption: req.body.caption,
                    imageUrl: req.body.imageUrl,
                }, {
                    where: {
                        id: postId
                    }
                })
                res.status(200).json({ code: "200", status: "OK", message: "Post Updated" })
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

export const deletePost = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const postId = req.params.id
                const post = await Post.findOne({
                    where: {
                        id: postId
                    },
                    raw: true
                })

                if (!post) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'Post not found'
                    });
                }

                if (post.userId !== decoded.userId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You only can delete your own post"
                    });
                }

                await Post.destroy({
                    where: {
                        id: postId
                    }
                })

                res.status(200).json({ code: "200", status: "OK", message: "Post Deleted" })
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
    const { count: totalItems, rows: posts } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, posts, totalPages, currentPage };
};

export const getRandomPost = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let postArray = []

                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Post.count();

                await Post.findAll({
                    order: Sequelize.literal('random()'),
                    raw: true,
                    limit: limit,
                    offset: offset
                }).then(async (data) => {
                    for await (const post of data) {
                        const totalLikes = await Like.count({ where: { postId: post.id } })
                        const isLikes = await Like.findOne({ where: { postId: post.id, userId: decoded.userId }, raw: true })
                        const user = await User.findOne({ where: { id: post.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        postArray.push({
                            id: post.id,
                            userId: post.userId,
                            imageUrl: post.imageUrl,
                            caption: post.caption,
                            isLike: isLikes ? true : false,
                            totalLikes,
                            user: user,
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt
                        })
                    }
                });

                const data = getPagingData({ count: total, rows: postArray }, page, limit);

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

export const getPostByUserId = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let postArray = []
                const { userId } = req.params
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Post.count({
                    where: {
                        userId,
                    },
                });

                await Post.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userId,
                    },
                }).then(async (data) => {
                    for await (const post of data) {
                        const totalLikes = await Like.count({ where: { postId: post.id } })
                        const isLikes = await Like.findOne({ where: { postId: post.id, userId: decoded.userId }, raw: true })
                        const user = await User.findOne({ where: { id: post.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        postArray.push({
                            id: post.id,
                            userId: post.userId,
                            imageUrl: post.imageUrl,
                            caption: post.caption,
                            isLike: isLikes ? true : false,
                            totalLikes,
                            user: user,
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt
                        })
                    }
                });

                const data = getPagingData({ count: total, rows: postArray }, page, limit);

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

export const getPostById = async (req, res) => {
    try {
        const { id } = req.params

        const postResponse = await Post.findOne({
            raw: true,
            where: {
                id,
            },
        })

        const userResponse = await User.findOne({ where: { id: postResponse.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

        const comments = []
        await Comment.findAll({ where: { postId: id }, raw: true }).then(async (data) => {
            for await (const comment of data) {
                const userComment = await User.findOne(
                    {
                        where: { id: comment.userId },
                        raw: true,
                        attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt']
                    })

                comments.push({
                    id: comment.id,
                    comment: comment.comment,
                    user: userComment,
                })
            }
        })

        const post = {
            id: postResponse.id,
            userId: postResponse.userId,
            imageUrl: postResponse.imageUrl,
            caption: postResponse.caption,
            user: userResponse,
            comments: comments,
            createdAt: postResponse.createdAt,
            updatedAt: postResponse.updatedAt
        }

        return res.status(200).json({
            code: "200",
            status: "OK",
            message: "Success",
            data: post,
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

export const getMyFollowingPosts = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const userIds = await getMyFollowingUserId(decoded.userId)

                let postArray = []
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Post.count({
                    where: {
                        userId: userIds,
                    },
                });

                await Post.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userId: userIds,
                    },
                }).then(async (data) => {
                    for await (const post of data) {
                        const totalLikes = await Like.count({ where: { postId: post.id } })
                        const isLikes = await Like.findOne({ where: { postId: post.id, userId: decoded.userId }, raw: true })
                        const user = await User.findOne({ where: { id: post.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        postArray.push({
                            id: post.id,
                            userId: post.userId,
                            imageUrl: post.imageUrl,
                            caption: post.caption,
                            isLike: isLikes ? true : false,
                            totalLikes,
                            user: user,
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt
                        })
                    }
                });

                const data = getPagingData({ count: total, rows: postArray }, page, limit);

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