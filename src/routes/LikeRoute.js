import express from 'express'
import { isAuth } from '../middleware/useIsAuth.js'
import { likePost, unlikePost } from '../controllers/LikeController.js'

const router = express.Router()

router.post('/api/v1/like', isAuth, likePost)
router.post('/api/v1/unlike', isAuth, unlikePost)

export default router;