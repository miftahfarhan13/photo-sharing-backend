import bcrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import User from "../models/UserModel.js";
import Follow from "../models/FollowModel.js";
import Validator from 'fastest-validator'

const v = new Validator()

export const registerUser = async (req, res) => {

    const schema = {
        name: "string",
        username: "string",
        email: "string",
        password: "string|min:6",
        passwordRepeat: "string|min:6",
        profilePictureUrl: "string|optional",
        bio: "string|optional",
        website: "string|optional",
        phoneNumber: "string|optional|min:0|max:13",
        // description: "number|optional|integer|positive|min:0|max:99", // additional properties
        // state: ["boolean", "number|min:0|max:1"] // multiple types
    }

    const validate = v.validate(req.body, schema)

    if (validate.length) {
        return res.status(400).json({ code: "400", status: "BAD_REQUEST", errors: validate })
    }

    const findUser = await User.findOne({
        where: {
            email: req.body.email
        }
    })

    if (!findUser) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                const user = {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    profilePictureUrl: req.body.profilePictureUrl,
                    phoneNumber: req.body.phoneNumber,
                    bio: req.body.bio,
                    website: req.body.website
                }

                User.create(user).then((result) => {
                    res.status(200).json({
                        code: "200",
                        status: "OK",
                        message: "User Created",
                        data: {
                            name: req.body.name,
                            username: req.body.username,
                            email: req.body.email,
                            password: hash,
                            profilePictureUrl: req.body.profilePictureUrl,
                            phoneNumber: req.body.phoneNumber,
                            bio: req.body.bio,
                            website: req.body.website
                        }
                    })
                }).catch((error) => {
                    res.status(500).json({
                        code: "500",
                        status: "SERVER_ERROR",
                        message: "Something went wrong",
                        errors: error.message
                    })
                })
            })
        })
    } else {
        res.status(409).json({
            code: "409",
            status: "CONFLICT",
            message: "Email already taken"
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');
            if (decoded) {
                res.clearCookie("jwt")
                res.status(200).json({
                    code: "200",
                    status: "OK",
                    message: "Logout successful",
                })
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

export const loginUser = async (req, res) => {
    try {
        const findUser = await User.findOne({
            where: {
                email: req.body.email
            }
        })

        if (findUser === null) {
            res.status(404).json({
                code: "404",
                status: "NOT_FOUND",
                message: "User not found"
            })
        } else {
            bcrypt.compare(req.body.password, findUser.password, (err, result) => {
                if (result) {
                    Jwt.sign({
                        email: findUser.email,
                        userId: findUser.id,
                        role: findUser.role,
                    }, 'secret', (err, token) => {
                        res.status(200).json({
                            code: "200",
                            status: "OK",
                            message: "Authentication successful",
                            user: {
                                id: findUser.id,
                                username: findUser.username,
                                name: findUser.name,
                                email: findUser.email,
                                role: findUser.role,
                                profilePictureUrl: findUser.profilePictureUrl,
                                phoneNumber: findUser.phoneNumber,
                                bio: findUser.bio,
                                website: findUser.website
                            },
                            token: token
                        })
                    })
                } else {
                    res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: "Wrong Password"
                    })
                }
            })
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

export const getUserLogin = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const findUser = await User.findOne({
                    where: {
                        id: decoded.userId
                    }
                })

                const totalFollowing = await Follow.count({ where: { userId: decoded.userId } })
                const totalFollowers = await Follow.count({ where: { userIdFollow: decoded.userId } })

                res.status(200).json({
                    code: "200",
                    status: "OK",
                    message: "User found",
                    data: {
                        id: findUser.id,
                        username: findUser.username,
                        name: findUser.name,
                        email: findUser.email,
                        profilePictureUrl: findUser.profilePictureUrl,
                        phoneNumber: findUser.phoneNumber,
                        bio: findUser.bio,
                        website: findUser.website,
                        totalFollowing,
                        totalFollowers
                    },
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
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}

export const getUserByUserId = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const { id } = req.params
                const findUser = await User.findOne({
                    where: {
                        id: id
                    }
                })

                const totalFollowing = await Follow.count({ where: { userId: id } })
                const totalFollowers = await Follow.count({ where: { userIdFollow: id } })

                res.status(200).json({
                    code: "200",
                    status: "OK",
                    message: "User found",
                    data: {
                        id: findUser.id,
                        username: findUser.username,
                        name: findUser.name,
                        email: findUser.email,
                        profilePictureUrl: findUser.profilePictureUrl,
                        phoneNumber: findUser.phoneNumber,
                        bio: findUser.bio,
                        website: findUser.website,
                        totalFollowing,
                        totalFollowers
                    },
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
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}

export const getAllUser = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id',
                'name',
                'email',
                'role',
                'profilePictureUrl',
                'phoneNumber',
            ],
            raw: true
        });

        res.status(200).json({
            code: "200",
            status: "OK",
            message: "Success",
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}

export const updateProfileUser = async (req, res) => {
    try {
        const schema = {
            name: "string|optional|min:1",
            email: "email|optional",
            profilePictureurl: "string|optional|min:1",
            phoneNumber: "string|optional|min:1",
            username: "string|optional|min:1",
            bio: "string|optional",
            website: "string|optional",
        }

        const validate = v.validate(req.body, schema)

        if (validate.length) {
            return res.status(400).json({ code: "400", status: "BAD_REQUEST", errors: validate })
        }

        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            const findUser = await User.findOne({
                where: {
                    id: decoded.userId
                }
            })

            if (findUser == null) {
                return res.status(404).json({
                    code: "404",
                    status: "NOT_FOUND",
                    message: "User not found"
                })
            }

            const findUserEmail = await User.findOne({
                where: {
                    email: req.body.email
                }
            })

            if (findUserEmail) {
                return res.status(404).json({
                    code: "409",
                    status: "CONFLICT",
                    message: "Email already taken"
                })
            }

            if (decoded) {
                await User.update({
                    name: req.body.name,
                    email: req.body.email,
                    profilePictureUrl: req.body.profilePictureUrl,
                    phoneNumber: req.body.phoneNumber,
                    username: req.body.username,
                    bio: req.body.bio,
                    website: req.body.website,
                }, {
                    where: {
                        id: decoded.userId
                    }
                })
                res.status(200).json({
                    code: "200",
                    status: "OK",
                    message: "User Updated"
                })
            } else {
                res.status(401).json({
                    code: "401",
                    status: "UNAUTHORIZED",
                    message: 'Unauthorized'
                });

            }
        } else {
            res.status(401).json({
                code: "401",
                status: "UNAUTHORIZED",
                message: 'Unauthorized'
            });
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