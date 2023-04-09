import express from 'express'
import { isAuth } from '../middleware/useIsAuth.js'
import { createFollow, deleteFollow, getAllMyFollowers, getAllMyFollowing, getFollowersByUserId, getFollowingByUserId } from '../controllers/FollowController.js'

const router = express.Router()

router.post('/api/v1/follow', isAuth, createFollow)
router.delete('/api/v1/unfollow/:userIdFollow', isAuth, deleteFollow)
router.get('/api/v1/my-following', isAuth, getAllMyFollowing)
router.get('/api/v1/my-followers', isAuth, getAllMyFollowers)
router.get('/api/v1/following/:userId', isAuth, getFollowingByUserId)
router.get('/api/v1/followers/:userId', isAuth, getFollowersByUserId)

export default router;