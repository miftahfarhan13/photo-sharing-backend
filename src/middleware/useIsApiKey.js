export const isApiKey = (req, res, next) => {
    if (!req.header("apiKey") || req.header("apiKey") !== "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b") {
        res.status(401).json({
            code: "401",
            status: "BAD_REQUEST",
            message: 'Invalid API KEY'
        })
        return
    }

    next()
}