import Follow from "../models/FollowModel.js";
import Validator from 'fastest-validator'
import Jwt from 'jsonwebtoken'
import User from "../models/UserModel.js";

const v = new Validator()

const checkIsFollowed = async (userId, userIdFollow) => {
    const response = await Follow.findOne({
        where: {
            userId: userId,
            userIdFollow: userIdFollow
        },
        raw: true
    })
    return !response ? false : true
}

export const createFollow = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const schema = {
                    userIdFollow: "string",
                }

                const validate = v.validate(req.body, schema)

                if (validate.length) {
                    return res.status(400).json({ code: "400", status: "BAD_REQUEST", errors: validate })
                }

                const decodedUserId = decoded.userId
                const userIdFollow = req.body.userIdFollow
                const user = await User.findOne({
                    where: {
                        id: userIdFollow
                    },
                    raw: true,
                    attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt']
                })

                if (!user) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'User not found'
                    });
                }

                if (user.id === decodedUserId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You can't follow your self"
                    });
                }

                const isFollowed = await checkIsFollowed(decodedUserId, userIdFollow)
                if (isFollowed) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You already follow this user"
                    });
                }

                await Follow.create({
                    userId: decodedUserId,
                    userIdFollow: userIdFollow,
                })
                res.status(200).json({ code: "200", status: "OK", message: "User Followed" })
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

export const deleteFollow = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const decodedUserId = decoded.userId
                const userIdFollow = req.params.userIdFollow
                const user = await User.findOne({
                    where: {
                        id: userIdFollow
                    },
                    raw: true,
                    attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt']
                })

                if (!user) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'User not found'
                    });
                }

                if (user.id === decodedUserId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You can't unfollow your self"
                    });
                }

                const isFollowed = await checkIsFollowed(decodedUserId, userIdFollow)
                if (!isFollowed) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You already unfollow this user"
                    });
                }

                await Follow.destroy({
                    where: {
                        userId: decodedUserId,
                        userIdFollow: userIdFollow
                    }
                })

                res.status(200).json({ code: "200", status: "OK", message: "User Unfollowed" })
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
    const { count: totalItems, rows: users } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, users, totalPages, currentPage };
};

export const getAllMyFollowing = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let users = []
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Follow.count({
                    where: {
                        userId: decoded.userId,
                    },
                });

                await Follow.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userId: decoded.userId,
                    },
                }).then(async (data) => {
                    for await (const follow of data) {
                        const user = await User.findOne({ where: { id: follow.userIdFollow }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        users.push(user)
                    }
                });

                const data = getPagingData({ count: total, rows: users }, page, limit);

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

export const getAllMyFollowers = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let users = []
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Follow.count({
                    where: {
                        userIdFollow: decoded.userId,
                    },
                });

                await Follow.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userIdFollow: decoded.userId,
                    },
                }).then(async (data) => {
                    for await (const follow of data) {
                        const user = await User.findOne({ where: { id: follow.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        users.push(user)
                    }
                });

                const data = getPagingData({ count: total, rows: users }, page, limit);

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

export const getFollowingByUserId = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let users = []
                const { userId } = req.params;
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Follow.count({
                    where: {
                        userId: userId,
                    },
                });

                await Follow.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userId: userId,
                    },
                }).then(async (data) => {
                    for await (const follow of data) {
                        const user = await User.findOne({ where: { id: follow.userIdFollow }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        users.push(user)
                    }
                });

                const data = getPagingData({ count: total, rows: users }, page, limit);

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

export const getFollowersByUserId = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                let users = []
                const { userId } = req.params;
                const { page, size } = req.query;
                const { limit, offset } = getPagination(page, size);

                const total = await Follow.count({
                    where: {
                        userIdFollow: userId,
                    },
                });

                await Follow.findAll({
                    raw: true,
                    limit,
                    offset,
                    where: {
                        userIdFollow: userId,
                    },
                }).then(async (data) => {
                    for await (const follow of data) {
                        const user = await User.findOne({ where: { id: follow.userId }, raw: true, attributes: ['id', 'username', 'email', 'profilePictureUrl', 'createdAt'] })

                        users.push(user)
                    }
                });

                const data = getPagingData({ count: total, rows: users }, page, limit);

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