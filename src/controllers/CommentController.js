import Comment from "../models/CommentModel.js";
import Validator from 'fastest-validator'
import Jwt from 'jsonwebtoken'

const v = new Validator()

export const createComment = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const schema = {
                    postId: "string",
                    comment: "string",
                }

                const validate = v.validate(req.body, schema)

                if (validate.length) {
                    return res.status(400).json({ code: "400", status: "BAD_REQUEST", errors: validate })
                }

                await Comment.create({
                    userId: decoded.userId,
                    postId: req.body.postId,
                    comment: req.body.comment,
                })
                res.status(200).json({ code: "200", status: "OK", message: "Comment Created" })
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

export const deleteComment = async (req, res) => {
    try {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization.split(' ')[1]
            const decoded = Jwt.verify(authorization, 'secret');

            if (decoded) {
                const { id } = req.params
                const comment = await Comment.findOne({
                    where: {
                        id: id,
                    },
                    raw: true
                })

                if (!comment) {
                    return res.status(404).json({
                        code: "404",
                        status: "NOT_FOUND",
                        message: 'Comment not found'
                    });
                }

                if (comment.userId !== decoded.userId) {
                    return res.status(404).json({
                        code: "404",
                        status: "CONFLICT",
                        message: "You only can delete your own comment"
                    });
                }

                await Comment.destroy({
                    where: {
                        id: id,
                    }
                })

                res.status(200).json({ code: "200", status: "OK", message: "Comment Deleted" })
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