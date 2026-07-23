import type { Session } from '@casino/shared'

/**
 * Storage seam: services depend on this interface, never on the Map itself.
 * Swapping in a real DB (Mongo/Postgres) means writing one new implementation
 * of this interface — nothing else in the app changes.
 */
export interface SessionRepository {
  get(id: string): Promise<Session | undefined>
  save(session: Session): Promise<void>
  delete(id: string): Promise<void>
}

function createInMemorySessionRepository(): SessionRepository {
  const sessions = new Map<string, Session>()

  return {
    async get(id) {
      return sessions.get(id)
    },
    async save(session) {
      sessions.set(session.id, session)
    },
    async delete(id) {
      sessions.delete(id)
    },
  }
}

export const sessionRepository = createInMemorySessionRepository()
