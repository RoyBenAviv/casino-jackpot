/**
 * @casino/shared — the single source of truth for types and constants
 * used by both the server and the client.
 *
 * This package is consumed as TypeScript source (see `exports` in its
 * package.json), so it must contain only erasable TS: types, `as const`
 * objects and pure functions — no enums, no runtime-only TS features.
 */

export * from './game'

export const APP_NAME = 'Casino Jackpot'

/** Response shape of GET /api/health. */
export interface HealthResponse {
  ok: boolean
  message: string
}

/** A player's game session, as stored on the server and sent over the wire. */
export interface Session {
  id: string
  credits: number
}

/** Response shape of POST /api/sessions and GET /api/sessions/current. */
export interface SessionResponse {
  session: Session
}
