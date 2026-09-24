import { Router } from 'express'
import {
  createAnnouncement,
  deleteAnnouncement,
  listActiveAnnouncements,
  listAnnouncements,
  updateAnnouncementStatus,
} from '../controllers/announcements.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/active', listActiveAnnouncements)

router.use(requireAuth, requirePermission('MANAGE_ANNOUNCEMENTS'))

router.get('/', listAnnouncements)
router.post('/', createAnnouncement)
router.patch('/:id/status', updateAnnouncementStatus)
router.delete('/:id', deleteAnnouncement)

export default router
