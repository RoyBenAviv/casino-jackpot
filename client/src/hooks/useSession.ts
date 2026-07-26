import { useEffect, useRef, useState } from 'react'
import type { Roll } from '@casino/shared'
import { apiService } from '../services/api-service'

/** The three blocks reveal one after another, at these delays after the server answers. */
const REVEAL_DELAYS_MS = [1000, 2000, 3000]

/**
 * Owns one game session and the roll "reveal" sequence.
 *
 * A round moves through: idle → (ROLL) all blocks spinning → server answers →
 * block 0 reveals at 1s, block 1 at 2s, block 2 at 3s → settled. Credits drop
 * by the 1-credit cost immediately; any reward lands on the final reveal. Every
 * credit value ultimately comes from the server — the client never computes it.
 *
 * `credits === null` means there is no open session (before load, or after a
 * cash-out closes it); the player then starts a new game explicitly.
 */
export function useSession() {
  const [credits, setCredits] = useState<number | null>(null)
  const [result, setResult] = useState<Roll | null>(null) // the current/last roll's symbols
  const [revealed, setRevealed] = useState(0) // how many blocks have flipped from spinning to result (0–3)
  const [spinning, setSpinning] = useState(false)
  const [banked, setBanked] = useState<number | null>(null)
  const [loading, setLoading] = useState(true) // bootstrap / cash-out / new-game in flight
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    // Rehydrate an existing session; if none exists (404), start a fresh one.
    apiService
      .getCurrentSession()
      .catch(() => apiService.createSession())
      .then(({ session }) => setCredits(session.credits))
      .finally(() => setLoading(false))

    const pending = timers.current
    return () => pending.forEach(clearTimeout) // never leave reveal timers running after unmount
  }, [])

  async function roll() {
    timers.current.forEach(clearTimeout) // clear any timers still running from a previous round
    setError(null)
    setSpinning(true)
    setRevealed(0)
    setResult(null)
    setCredits((c) => (c === null ? c : c - 1)) // pay the cost up front (brief: deducted by 1)

    let res
    try {
      res = await apiService.roll()
    } catch {
      // Recover: stop spinning, report it, and re-sync credits so the optimistic −1 can't drift.
      setSpinning(false)
      setError('Roll failed — please try again.')
      apiService
        .getCurrentSession()
        .then(({ session }) => setCredits(session.credits))
        .catch(() => {})
      return
    }
    setResult(res.roll)

    // Reveal the blocks one at a time; the last one settles the round.
    timers.current = REVEAL_DELAYS_MS.map((ms, i) =>
      window.setTimeout(() => {
        setRevealed(i + 1)
        if (i === REVEAL_DELAYS_MS.length - 1) {
          setSpinning(false)
          setCredits(res.credits) // authoritative final credits (adds any reward)
        }
      }, ms),
    )
  }

  async function cashout() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiService.cashout()
      setBanked(res.account.balance)
      setCredits(null) // the session is now closed — no auto-restart
      setResult(null)
      setRevealed(0)
    } catch {
      setError('Cash-out failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function newGame() {
    setLoading(true)
    setError(null)
    setBanked(null)
    setResult(null)
    setRevealed(0)
    try {
      const { session } = await apiService.createSession()
      setCredits(session.credits)
    } catch {
      setError('Could not start a new game — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { credits, result, revealed, spinning, banked, loading, error, roll, cashout, newGame }
}
