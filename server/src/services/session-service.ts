import { STARTING_CREDITS, type Session } from '@casino/shared'
import { sessionRepository } from '../repositories/session-repository'

export async function createSession(): Promise<Session> {
  const session: Session = { id: crypto.randomUUID(), credits: STARTING_CREDITS }
  await sessionRepository.save(session)
  return session
}

export async function getSession(id: string): Promise<Session | undefined> {
  return sessionRepository.get(id)
}
