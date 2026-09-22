import { Router } from 'express'
import {
  approveMembershipRequest,
  createMembershipRequest,
  deleteMembershipRequest,
  listMembershipRequests,
} from '../controllers/membershipRequests.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', createMembershipRequest)

router.get('/', requireAuth, requirePermission('APPROVE_MEMBERS'), listMembershipRequests)
router.post(
  '/:id/approve',
  requireAuth,
  requirePermission('APPROVE_MEMBERS'),
  approveMembershipRequest,
)
router.delete(
  '/:id',
  requireAuth,
  requirePermission('APPROVE_MEMBERS'),
  deleteMembershipRequest,
)

export default router
