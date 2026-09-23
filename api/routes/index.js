import { Router } from 'express'
import authRoutes from './auth.routes.js'
import eventsRoutes from './events.routes.js'
import leaveRequestsRoutes from './leaveRequests.routes.js'
import membershipRequestsRoutes from './membershipRequests.routes.js'
import membersRoutes from './members.routes.js'
import positionsRoutes from './positions.routes.js'
import usersRoutes from './users.routes.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/members', membersRoutes)
router.use('/positions', positionsRoutes)
router.use('/membership-requests', membershipRequestsRoutes)
router.use('/leave-requests', leaveRequestsRoutes)
router.use('/events', eventsRoutes)

export default router
