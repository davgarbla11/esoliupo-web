import { Router } from 'express'
import {
  approveLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  listLeaveRequests,
} from '../controllers/leaveRequests.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'
import { mailRateLimit, requireSameOrigin } from '../middlewares/mailGuard.middleware.js'

const router = Router()

router.post('/', requireAuth, createLeaveRequest)

router.get('/', requireAuth, requirePermission('APPROVE_MEMBERS'), listLeaveRequests)
router.post(
  '/:id/approve',
  requireAuth,
  requirePermission('APPROVE_MEMBERS'),
  requireSameOrigin,
  mailRateLimit,
  approveLeaveRequest,
)
router.delete('/:id', requireAuth, requirePermission('APPROVE_MEMBERS'), deleteLeaveRequest)

export default router
