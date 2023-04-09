import 'dotenv/config'

const {
    BASE_URL
} = process.env

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            const err = new Error('Image file is required')
            err.errorStatus = 422;
            throw err
        }

        const image = req.file.filename
        res.status(200).json({
            code: "200",
            status: "OK",
            message: "Upload image success",
            url: `${BASE_URL}/images/${image}`
        })
    } catch (error) {
        res.status(500).json({
            code: "500",
            status: "SERVER_ERROR",
            message: "Something went wrong",
            errors: error.message
        })
    }
}