import { Router } from 'express'
import { listUsers, updateUserRole } from '../controllers/users.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(requireAuth, requirePermission('MANAGE_USERS'))

router.get('/', listUsers)
router.patch('/:id/role', requirePermission('MANAGE_ROLES'), updateUserRole)

export default router
