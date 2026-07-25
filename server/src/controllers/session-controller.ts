import type { Request, Response } from 'express'
import * as sessionService from '../services/session-service'
import type { Rng } from '../services/game-service'
import { httpError } from '../middlewares/error-handler'

/** The session id travels ONLY in this httpOnly cookie — invisible to client JS. */
export const SESSION_COOKIE = 'sessionId'

/** The account id — anonymous, long-lived, so cashed-out credits persist across sessions. */
export const ACCOUNT_COOKIE = 'accountId'
const ACCOUNT_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 // 1 year

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

export async function roll(req: Request, res: Response) {
  const sessionId: string | undefined = req.cookies[SESSION_COOKIE]
  const rng: Rng = req.app.locals.rng

  res.json(await sessionService.roll(sessionId, rng))
}

export async function cashout(req: Request, res: Response) {
  const sessionId: string | undefined = req.cookies[SESSION_COOKIE]
  const accountId: string | undefined = req.cookies[ACCOUNT_COOKIE]

  const { cashedOut, account } = await sessionService.cashout(sessionId, accountId)

  res.clearCookie(SESSION_COOKIE)
  res.cookie(ACCOUNT_COOKIE, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: ACCOUNT_COOKIE_MAX_AGE,
  })
  res.json({ cashedOut, account: { balance: account.balance } })
}
