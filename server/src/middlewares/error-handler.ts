import type { NextFunction, Request, Response } from 'express'

/**
 * Catch-all error handler. Express recognizes it by its 4-argument
 * signature, so `_next` must stay even though it is unused.
 * Express 5 forwards rejected promises from async handlers here automatically.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  if (res.headersSent) return
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  })
}
