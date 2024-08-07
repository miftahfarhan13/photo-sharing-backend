import Jwt from 'jsonwebtoken'

export const getSession = async (req) => {
    if (req.headers && req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ')[1]
        const decoded = Jwt.verify(authorization, 'secret');

        if (decoded) return { status: "OK", decoded }
        else return { status: "UNAUTHORIZED" }
    } else {
        return { status: "UNAUTHORIZED" }
    }
}