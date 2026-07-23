// Game constants — the single source of truth for both server and client.

export const STARTING_CREDITS = 10
export const ROLL_COST = 1

export const SYMBOLS = ['cherry', 'lemon', 'orange', 'watermelon'] as const

/** One of the four slot symbols ('cherry' | 'lemon' | 'orange' | 'watermelon'). */
export type SlotSymbol = (typeof SYMBOLS)[number]

/** Credits paid when three of this symbol land. */
export const REWARDS: Record<SlotSymbol, number> = {
  cherry: 10,
  lemon: 20,
  orange: 30,
  watermelon: 40,
}

/** Presentation letters (client display: C / L / O / W). */
export const SYMBOL_LETTERS: Record<SlotSymbol, string> = {
  cherry: 'C',
  lemon: 'L',
  orange: 'O',
  watermelon: 'W',
}

/**
 * The house edge: the chance that a winning roll is secretly re-rolled,
 * based on the session's credits. Used by BOTH the server cheat (re-roll)
 * and the client CASH OUT button (dodge) — one function, one truth.
 * Bands: <40 → 0 · 40–60 (inclusive) → 0.3 · >60 → 0.6
 */
export function cheatChanceFor(credits: number): number {
  if (credits > 60) return 0.6
  if (credits >= 40) return 0.3
  return 0
}
