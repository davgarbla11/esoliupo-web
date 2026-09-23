import { Router } from 'express'
import multer from 'multer'
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  listPublicEvents,
  updateEvent,
  uploadEventContentImage,
  uploadEventCover,
} from '../controllers/events.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error('Formato de imagen no soportado. Usa JPG, PNG o WEBP.')
      error.status = 400
      return cb(error)
    }
    cb(null, true)
  },
})

const router = Router()

router.get('/public', listPublicEvents)

router.use(requireAuth, requirePermission('MANAGE_EVENTS'))

router.get('/', listEvents)
router.post('/', createEvent)
router.post('/content-images', upload.single('image'), uploadEventContentImage)
router.get('/:id', getEvent)
router.patch('/:id', updateEvent)
router.delete('/:id', deleteEvent)
router.post('/:id/cover', upload.single('cover'), uploadEventCover)

export default router
