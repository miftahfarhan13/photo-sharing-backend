import express from 'express'
import { isAuth } from '../middleware/useIsAuth.js'
import { createComment, deleteComment } from '../controllers/CommentController.js'

const router = express.Router()

router.post('/api/v1/create-comment', isAuth, createComment)
router.delete('/api/v1/delete-comment/:id', isAuth, deleteComment)

export default router;