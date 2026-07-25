import { ROLL_COST, STARTING_CREDITS, type RollResponse, type Session } from '@casino/shared'
import { sessionRepository } from '../repositories/session-repository'
import { resolveRoll, type Rng } from './game-service'
import { httpError } from '../middlewares/error-handler'

export async function createSession(): Promise<Session> {
  const session: Session = { id: crypto.randomUUID(), credits: STARTING_CREDITS }
  await sessionRepository.save(session)
  return session
}

export async function getSession(id: string): Promise<Session | undefined> {
  return sessionRepository.get(id)
}

/**
 * Play one roll on the cookie's session: guard it exists and has credits,
 * pay the cost, run the (cheating) engine on the POST-cost balance, bank any
 * reward, persist. `rng` is injected so the endpoint stays testable.
 */
export async function roll(sessionId: string | undefined, rng: Rng): Promise<RollResponse> {
  const session = sessionId ? await sessionRepository.get(sessionId) : undefined
  if (!session) throw httpError(404, 'SESSION_NOT_FOUND', 'No active game session')
  if (session.credits < ROLL_COST) {
    throw httpError(409, 'INSUFFICIENT_CREDITS', 'Not enough credits to roll')
  }

  const creditsAfterCost = session.credits - ROLL_COST
  const roll = resolveRoll(creditsAfterCost, rng)

  session.credits = creditsAfterCost + roll.reward
  await sessionRepository.save(session)

  return { roll, credits: session.credits }
}
