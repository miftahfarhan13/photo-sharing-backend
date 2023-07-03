import 'dotenv/config'

const {
    BASE_URL
} = process.env

export const uploadImage = async (req, res) => {
    const maxFileSize = 1024 * 1024

    try {
        const { image } = req.files;

        // If no image submitted, exit
        if (!image) {
            return res.status(404).json({
                code: "400",
                status: "BAD_REQUEST",
                message: "Image file is required"
            })
        }

        // If image size higher than 1 Mb
        if (image.size > maxFileSize) {
            return res.status(404).json({
                code: "400",
                status: "BAD_REQUEST",
                message: "File size must be lower than 1 Mb"
            })
        }

        // If does not have image mime type prevent from uploading
        if (image.mimetype !== 'image/png' &&
            image.mimetype !== 'image/jpg' &&
            image.mimetype !== 'image/jpeg' &&
            image.mimetype !== 'image/svg+xml' &&
            image.mimetype !== 'image/webp') {

            return res.status(404).json({
                code: "400",
                status: "BAD_REQUEST",
                message: "File format must be PNG, JPG, JPEG, SVEG or WEBP"
            })
        }

        const imageFileName = new Date().getTime() + '-' + image.name.replaceAll(' ', '-').toLowerCase()

        // Move the uploaded image to our upload folder
        image.mv('public/images/' + imageFileName);

        res.status(200).json({
            code: "200",
            status: "OK",
            message: "Upload image success",
            url: `${BASE_URL}/images/${imageFileName}`
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