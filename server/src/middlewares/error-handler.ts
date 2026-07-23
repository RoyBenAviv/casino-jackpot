import type { NextFunction, Request, Response } from 'express'

export interface HttpError extends Error {
  status: number
  code: string
}

/**
 * Build a throwable HTTP error: `throw httpError(404, 'SESSION_NOT_FOUND', '...')`.
 * Express 5 forwards async throws to the error handler automatically — no try/catch needed.
 */
export function httpError(status: number, code: string, message: string): HttpError {
  return Object.assign(new Error(message), { status, code })
}

function isHttpError(err: unknown): err is HttpError {
  return err instanceof Error && 'status' in err && 'code' in err
}

/**
 * Catch-all error handler. Express recognizes it by its 4-argument
 * signature, so `_next` must stay even though it is unused.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return

  if (isHttpError(err)) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message },
    })
    return
  }

  console.error(err)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  })
}
