import { Router } from 'express'
import {
  createTraining,
  deleteTraining,
  enrollInTraining,
  getTraining,
  listPublicTrainings,
  listTrainings,
  unenrollFromTraining,
  updateTraining,
} from '../controllers/trainings.controller.js'
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.get('/public', listPublicTrainings)
router.post('/:id/enroll', enrollInTraining)
router.delete('/:id/enroll', unenrollFromTraining)

router.use(requirePermission('MANAGE_TRAININGS'))

router.get('/', listTrainings)
router.post('/', createTraining)
router.get('/:id', getTraining)
router.patch('/:id', updateTraining)
router.delete('/:id', deleteTraining)

export default router
