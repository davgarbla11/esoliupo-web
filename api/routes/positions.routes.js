import { Router } from 'express'
import {
  createPosition,
  deletePosition,
  listPositions,
  updatePosition,
} from '../controllers/positions.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(requireAuth, requirePermission('MANAGE_SITE_CONTENT'))

router.get('/', listPositions)
router.post('/', createPosition)
router.patch('/:id', updatePosition)
router.delete('/:id', deletePosition)

export default router
