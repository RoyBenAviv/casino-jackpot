import { useEffect, useState } from 'react'
import type { Roll } from '@casino/shared'
import { apiService } from '../services/api-service'

/**
 * Owns the game session on the client. On mount it rehydrates via the cookie
 * (GET /current) and, if there's no session yet, creates one. All credits come
 * from the server's responses — the client never computes them.
 *
 * `credits === null` means there is no open session (before load, or after a
 * cash-out closes it); the player then starts a new game explicitly.
 */
export function useSession() {
  const [credits, setCredits] = useState<number | null>(null)
  const [lastRoll, setLastRoll] = useState<Roll | null>(null)
  const [banked, setBanked] = useState<number | null>(null)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    // Rehydrate an existing session; if none exists (404), start a fresh one.
    apiService
      .getCurrentSession()
      .catch(() => apiService.createSession())
      .then(({ session }) => setCredits(session.credits))
      .finally(() => setBusy(false))
  }, [])

  async function newGame() {
    setBusy(true)
    setLastRoll(null)
    setBanked(null)
    const { session } = await apiService.createSession()
    setCredits(session.credits)
    setBusy(false)
  }

  async function roll() {
    setBusy(true)
    const res = await apiService.roll()
    setLastRoll(res.roll)
    setCredits(res.credits)
    setBusy(false)
  }

  async function cashout() {
    setBusy(true)
    const res = await apiService.cashout()
    setBanked(res.account.balance)
    setCredits(null) // the session is now closed — no auto-restart
    setBusy(false)
  }

  return { credits, lastRoll, banked, busy, roll, cashout, newGame }
}
