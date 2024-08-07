import express from 'express'
import { isAuth } from '../middleware/useIsAuth.js'
import { createStory, deleteStory, getMyFollowingStories, getStoryById, getViewsByStoryId } from '../controllers/StoryController.js'

const router = express.Router()

router.post('/api/v1/create-story', isAuth, createStory)
router.delete('/api/v1/delete-story/:id', isAuth, deleteStory)
router.get('/api/v1/following-story', isAuth, getMyFollowingStories)
router.get('/api/v1/story/:id', isAuth, getStoryById)
router.get('/api/v1/story-views/:id', isAuth, getViewsByStoryId)

export default router;