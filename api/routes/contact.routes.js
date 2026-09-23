import { Router } from 'express'
import {
  createContactMessage,
  deleteContactMessage,
  listContactMessages,
  replyToContactMessage,
} from '../controllers/contact.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'
import { mailRateLimit, requireSameOrigin } from '../middlewares/mailGuard.middleware.js'

const router = Router()

router.post('/', requireSameOrigin, mailRateLimit, createContactMessage)

router.get('/', requireAuth, requirePermission('MANAGE_CONTACT'), listContactMessages)
router.post(
  '/:id/reply',
  requireAuth,
  requirePermission('MANAGE_CONTACT'),
  requireSameOrigin,
  mailRateLimit,
  replyToContactMessage,
)
router.delete('/:id', requireAuth, requirePermission('MANAGE_CONTACT'), deleteContactMessage)

export default router
