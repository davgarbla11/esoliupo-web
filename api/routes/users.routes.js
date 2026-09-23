import { Router } from 'express'
import multer from 'multer'
import {
  createUser,
  getNotifiableCount,
  listUserDirectory,
  listUsers,
  resetUserPassword,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
  uploadUserAvatar,
} from '../controllers/users.controller.js'
import {
  requireAuth,
  requirePermission,
  requireRole,
  requireSelfOrPermission,
} from '../middlewares/auth.middleware.js'

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

router.post(
  '/:id/avatar',
  requireAuth,
  requireSelfOrPermission('MANAGE_USERS'),
  upload.single('avatar'),
  uploadUserAvatar,
)

router.patch(
  '/:id/profile',
  requireAuth,
  requireSelfOrPermission('MANAGE_USERS'),
  updateUserProfile,
)

router.patch(
  '/:id/status',
  requireAuth,
  requireSelfOrPermission('MANAGE_USERS'),
  updateUserStatus,
)

router.get('/directory', requireAuth, requirePermission('MANAGE_TRAININGS'), listUserDirectory)
router.get('/notifiable-count', requireAuth, requireRole('JUNTA_DIRECTIVA'), getNotifiableCount)

router.use(requireAuth, requirePermission('MANAGE_USERS'))

router.get('/', listUsers)
router.post('/', createUser)
router.patch('/:id/role', requirePermission('MANAGE_ROLES'), updateUserRole)
router.post('/:id/reset-password', resetUserPassword)

export default router
