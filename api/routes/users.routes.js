import { Router } from 'express'
import {
  listUsers,
  resetUserPassword,
  updateUserRole,
  updateUserStatus,
} from '../controllers/users.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(requireAuth, requirePermission('MANAGE_USERS'))

router.get('/', listUsers)
router.patch('/:id/role', requirePermission('MANAGE_ROLES'), updateUserRole)
router.patch('/:id/status', updateUserStatus)
router.post('/:id/reset-password', resetUserPassword)

export default router
