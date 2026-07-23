import type { Request, Response } from 'express'
import * as sessionService from '../services/session-service'
import { httpError } from '../middlewares/error-handler'

/** The session id travels ONLY in this httpOnly cookie — invisible to client JS. */
export const SESSION_COOKIE = 'sessionId'

export async function createSession(_req: Request, res: Response) {
  const session = await sessionService.createSession()

  res.cookie(SESSION_COOKIE, session.id, { httpOnly: true, sameSite: 'lax' })
  res.status(201).json({ session })
}

export async function getCurrentSession(req: Request, res: Response) {
  const sessionId: string | undefined = req.cookies[SESSION_COOKIE]
  const session = sessionId ? await sessionService.getSession(sessionId) : undefined

  if (!session) throw httpError(404, 'SESSION_NOT_FOUND', 'No active game session')

  res.json({ session })
}
