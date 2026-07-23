import express from 'express'
import healthRoutes from './health.routes'
import sessionRoutes from './session.routes'

/** Root API router — every feature router is mounted here. */
const router = express.Router()

router.use(healthRoutes)
router.use(sessionRoutes)

export default router
