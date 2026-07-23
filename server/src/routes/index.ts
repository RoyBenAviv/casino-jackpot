import express from 'express'
import healthRoutes from './health.routes'

/** Root API router — every feature router is mounted here. */
const router = express.Router()

router.use(healthRoutes)

export default router
