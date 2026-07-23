import express from 'express'
import { createSession, getCurrentSession } from '../controllers/session-controller'

const router = express.Router()

router.post('/sessions', createSession)
router.get('/sessions/current', getCurrentSession)

export default router
