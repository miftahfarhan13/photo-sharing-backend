import Jwt from 'jsonwebtoken'

export const isAuth = (req, res, next) => {
    if (!req.header("apiKey") || req.header("apiKey") !== "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b") {
        res.status(401).json({
            code: "401",
            status: "BAD_REQUEST",
            message: 'Invalid API KEY'
        })
        return
    }

    if (req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ')[1]
        const decoded = Jwt.verify(authorization, 'secret');
        if (!decoded) {
            return res.status(401).json({
                code: "401",
                status: "UNAUTHORIZED",
                message: 'Unauthorized please login first'
            });
        }
    } else {
        return res.status(401).json({
            code: "401",
            status: "UNAUTHORIZED",
            message: 'Unauthorized please login first'
        });
    }


    next()
}