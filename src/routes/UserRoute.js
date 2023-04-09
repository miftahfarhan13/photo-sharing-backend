import express from 'express'
import { getAllUser, getUserByUserId, getUserLogin, loginUser, logoutUser, registerUser, updateProfileUser } from '../controllers/UserController.js'
import { isAuth } from '../middleware/useIsAuth.js'
import { isApiKey } from '../middleware/useIsApiKey.js'

const router = express.Router()

router.post('/api/v1/register', isApiKey, registerUser)
router.post('/api/v1/update-profile', isAuth, updateProfileUser)
router.post('/api/v1/login', isApiKey, loginUser)
router.get('/api/v1/user', isAuth, getUserLogin)
router.get('/api/v1/user/:id', isAuth, getUserByUserId)
router.get('/api/v1/all-user', isApiKey, getAllUser)
router.get('/api/v1/logout', isApiKey, logoutUser)

export default router;