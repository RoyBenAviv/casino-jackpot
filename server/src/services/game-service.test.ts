import { describe, expect, it } from 'vitest'
import { resolveRoll, type Rng } from './game-service'

/** An rng that returns the given values in order — every "random" step becomes exact. */
function scriptedRng(values: number[]): Rng {
  let i = 0
  return () => values[i++]
}

// SYMBOLS order is [cherry, lemon, orange, watermelon] → rng 0 / 0.25 / 0.5 / 0.75
describe('resolveRoll', () => {
  it('mixed symbols lose and pay nothing', () => {
    const roll = resolveRoll(10, scriptedRng([0, 0.25, 0.5]))

    expect(roll).toEqual({ symbols: ['cherry', 'lemon', 'orange'], win: false, reward: 0 })
  })

  it('three matching symbols pay their reward (no cheat below 40 credits)', () => {
    const roll = resolveRoll(10, scriptedRng([0.75, 0.75, 0.75, 0.99]))

    expect(roll).toEqual({
      symbols: ['watermelon', 'watermelon', 'watermelon'],
      win: true,
      reward: 40,
    })
  })

  it('a win inside the cheat band can be secretly re-rolled — the re-roll stands', () => {
    // cherry win → cheat check 0.1 < 0.3 → re-roll lands mixed → player sees a loss
    const roll = resolveRoll(50, scriptedRng([0, 0, 0, 0.1, 0, 0.25, 0.5]))

    expect(roll.win).toBe(false)
    expect(roll.reward).toBe(0)
  })

  it('a re-rolled win still pays — the house cheats at most once', () => {
    // cherry win → cheat → re-roll lands watermelons → still a win, and it is final
    const roll = resolveRoll(100, scriptedRng([0, 0, 0, 0.1, 0.75, 0.75, 0.75]))

    expect(roll).toEqual({
      symbols: ['watermelon', 'watermelon', 'watermelon'],
      win: true,
      reward: 40,
    })
  })
})
