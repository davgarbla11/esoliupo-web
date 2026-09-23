import { Router } from 'express'
import { listAuditLogs, sendTestEmail } from '../controllers/admin.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'
import { mailRateLimit, requireSameOrigin } from '../middlewares/mailGuard.middleware.js'

const router = Router()

router.use(requireAuth, requirePermission('SUPERADMIN'))

router.post('/test-email', requireSameOrigin, mailRateLimit, sendTestEmail)
router.get('/logs', listAuditLogs)

export default router
