import express from 'express'
import { isAuth } from '../middleware/useIsAuth.js'
import { createPost, deletePost, getMyFollowingPosts, getPostById, getPostByUserId, getRandomPost, updatePost } from '../controllers/PostController.js'

const router = express.Router()

router.post('/api/v1/create-post', isAuth, createPost)
router.post('/api/v1/update-post/:id', isAuth, updatePost)
router.delete('/api/v1/delete-post/:id', isAuth, deletePost)
router.get('/api/v1/explore-post', isAuth, getRandomPost)
router.get('/api/v1/users-post/:userId', isAuth, getPostByUserId)
router.get('/api/v1/post/:id', isAuth, getPostById)
router.get('/api/v1/following-post', isAuth, getMyFollowingPosts)

export default router;