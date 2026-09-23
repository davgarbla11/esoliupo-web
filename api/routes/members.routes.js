import { Router } from 'express'
import { listPublicMembers } from '../controllers/members.controller.js'

const router = Router()

router.get('/', listPublicMembers)

export default router
