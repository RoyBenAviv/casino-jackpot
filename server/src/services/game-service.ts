import { REWARDS, SYMBOLS, cheatChanceFor, type Roll, type SlotSymbol } from '@casino/shared'

/**
 * Random source: returns a number in [0, 1), like Math.random.
 * Injectable so tests can script exact outcomes — the engine itself is pure.
 */
export type Rng = () => number

/** Draw 3 independent symbols. */
export function spin(rng: Rng): [SlotSymbol, SlotSymbol, SlotSymbol] {
  const draw = () => SYMBOLS[Math.floor(rng() * SYMBOLS.length)]
  return [draw(), draw(), draw()]
}

function toRoll(symbols: [SlotSymbol, SlotSymbol, SlotSymbol]): Roll {
  const win = symbols[0] === symbols[1] && symbols[1] === symbols[2]
  return { symbols, win, reward: win ? REWARDS[symbols[0]] : 0 }
}

/**
 * The heart of the house edge. Roll once; if it WON, the house may secretly
 * re-roll — with chance cheatChanceFor(credits) — and the re-roll is what the
 * player sees, final either way (a re-rolled win still pays). Losses are
 * never re-rolled, and the discarded first roll never leaves this function.
 */
export function resolveRoll(credits: number, rng: Rng): Roll {
  const first = toRoll(spin(rng))

  const cheat = first.win && rng() < cheatChanceFor(credits)
  if (!cheat) return first

  return toRoll(spin(rng))
}
