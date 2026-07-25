import express from 'express'
import { createSession, getCurrentSession, roll } from '../controllers/session-controller'

const router = express.Router()

router.post('/sessions', createSession)
router.get('/sessions/current', getCurrentSession)
router.post('/sessions/current/rolls', roll)

export default router
