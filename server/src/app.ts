import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import routes from './routes'
import { notFoundHandler } from './middlewares/not-found'
import { errorHandler } from './middlewares/error-handler'
import type { Rng } from './services/game-service'
import { env } from './config/env'

// The built client, relative to this file (server/dist at runtime → repo/client/dist).
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist')

/**
 * In production the client is built to static files; Express serves them so the
 * whole app runs from ONE origin (no CORS, first-party cookies). In dev this dir
 * doesn't exist — Vite serves the client — so this is skipped automatically.
 */
function serveBuiltClient(app: Express) {
  if (!existsSync(clientDist)) return

  app.use(express.static(clientDist))
  // SPA fallback: any non-API GET returns index.html so the client-side app loads.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

/**
 * Builds the Express app without binding a port, so tests can exercise
 * the real app through Supertest. `index.ts` is the only file that listens.
 * `rng` defaults to Math.random; tests pass a scripted one for exact outcomes.
 */
export function buildApp({ rng = Math.random }: { rng?: Rng } = {}) {
  const app = express()
  app.locals.rng = rng

  const corsOptions = {
    origin: env.clientOrigin,
    credentials: true, // let the session cookie cross origins (5173 -> 3000)
  }

  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api', routes)

  serveBuiltClient(app)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
