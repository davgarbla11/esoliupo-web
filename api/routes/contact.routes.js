import { Router } from 'express'
import {
  createContactMessage,
  listContactMessages,
  replyToContactMessage,
} from '../controllers/contact.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'
import { mailRateLimit, requireSameOrigin } from '../middlewares/mailGuard.middleware.js'

const router = Router()

router.post('/', requireSameOrigin, createContactMessage)

router.get('/', requireAuth, requirePermission('MANAGE_CONTACT'), listContactMessages)
router.post(
  '/:id/reply',
  requireAuth,
  requirePermission('MANAGE_CONTACT'),
  requireSameOrigin,
  mailRateLimit,
  replyToContactMessage,
)

export default router
