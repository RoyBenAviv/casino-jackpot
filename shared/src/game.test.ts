import { describe, expect, it } from 'vitest'
import { cheatChanceFor } from './game'

describe('cheatChanceFor', () => {
  it('returns 0 below 40 credits', () => {
    expect(cheatChanceFor(0)).toBe(0)
    expect(cheatChanceFor(39)).toBe(0)
  })

  it('returns 0.3 from 40 to 60 credits (inclusive edges)', () => {
    expect(cheatChanceFor(40)).toBe(0.3)
    expect(cheatChanceFor(60)).toBe(0.3)
  })

  it('returns 0.6 above 60 credits', () => {
    expect(cheatChanceFor(61)).toBe(0.6)
    expect(cheatChanceFor(100)).toBe(0.6)
  })
})
