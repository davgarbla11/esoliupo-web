import { Router } from 'express'
import { googleLogin, login, logout, me } from '../controllers/auth.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { authRateLimit } from '../middlewares/authRateLimit.middleware.js'

const router = Router()

router.post('/login', authRateLimit, login)
router.post('/google', authRateLimit, googleLogin)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
