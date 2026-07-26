import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('../services/api-service', () => ({
  apiService: {
    getCurrentSession: vi.fn().mockResolvedValue({ session: { credits: 10 } }),
    createSession: vi.fn(),
    roll: vi.fn().mockResolvedValue({
      roll: { symbols: ['cherry', 'cherry', 'cherry'], win: true, reward: 10 },
      credits: 19,
    }),
    cashout: vi.fn(),
  },
}))

import { apiService } from '../services/api-service'
import { useSession } from './useSession'

describe('useSession reveal sequence', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reveals the three blocks at 1s / 2s / 3s and banks the reward only at the end', async () => {
    const { result } = renderHook(() => useSession())
    await act(async () => {}) // let the bootstrap request resolve
    expect(result.current.credits).toBe(10)

    await act(async () => {
      result.current.roll()
    })
    expect(result.current.spinning).toBe(true)
    expect(result.current.revealed).toBe(0)
    expect(result.current.credits).toBe(9) // cost paid up front

    await act(async () => await vi.advanceTimersByTimeAsync(1000))
    expect(result.current.revealed).toBe(1)

    await act(async () => await vi.advanceTimersByTimeAsync(1000))
    expect(result.current.revealed).toBe(2)

    await act(async () => await vi.advanceTimersByTimeAsync(1000))
    expect(result.current.revealed).toBe(3)
    expect(result.current.spinning).toBe(false)
    expect(result.current.credits).toBe(19) // reward applied at the final reveal
  })

  it('recovers from a failed roll instead of freezing on spin', async () => {
    vi.mocked(apiService.roll).mockRejectedValueOnce(new Error('network'))
    const { result } = renderHook(() => useSession())
    await act(async () => {}) // let bootstrap resolve

    await act(async () => {
      await result.current.roll()
    })

    expect(result.current.spinning).toBe(false) // not stuck spinning
    expect(result.current.error).toBeTruthy() // and the player is told
  })
})
