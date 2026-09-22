import { Router } from 'express'
import authRoutes from './auth.routes.js'
import membersRoutes from './members.routes.js'
import usersRoutes from './users.routes.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/members', membersRoutes)

export default router
