import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settings.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getSettings)
router.patch('/', requireAuth, requirePermission('SUPERADMIN'), updateSettings)

export default router
