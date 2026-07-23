import type { Request, Response } from 'express'

/** Mounted after all routes — anything that reaches it is a 404. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} does not exist`,
    },
  })
}
