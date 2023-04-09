import express from 'express'
import { uploadImage } from '../controllers/ImageController.js';
import { isAuth } from '../middleware/useIsAuth.js'

const router = express.Router()

router.post('/api/v1/upload-image', isAuth, uploadImage)

export default router;