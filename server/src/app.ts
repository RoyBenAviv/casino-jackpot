import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import routes from './routes'
import { notFoundHandler } from './middlewares/not-found'
import { errorHandler } from './middlewares/error-handler'
import { env } from './config/env'

/**
 * Builds the Express app without binding a port, so tests can exercise
 * the real app through Supertest. `index.ts` is the only file that listens.
 */
export function buildApp() {
  const app = express()

  const corsOptions = {
    origin: env.clientOrigin,
    credentials: true, // let the session cookie cross origins (5173 -> 3000)
  }

  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api', routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
