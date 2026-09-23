import { Router } from 'express'
import {
  changePassword,
  forgotPassword,
  googleLogin,
  login,
  logout,
  me,
  resetPasswordWithToken,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { authRateLimit } from '../middlewares/authRateLimit.middleware.js'
import { requireSameOrigin } from '../middlewares/mailGuard.middleware.js'

const router = Router()

router.post('/login', authRateLimit, login)
router.post('/google', authRateLimit, googleLogin)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.post('/change-password', requireAuth, authRateLimit, changePassword)
router.post('/forgot-password', requireSameOrigin, authRateLimit, forgotPassword)
router.post('/reset-password', requireSameOrigin, authRateLimit, resetPasswordWithToken)

export default router
