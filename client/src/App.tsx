import { APP_NAME, SYMBOL_EMOJI } from '@casino/shared'
import { useSession } from './hooks/useSession'

/**
 * The slot machine: 3 blocks in a row, a ROLL and a CASH OUT button.
 * Blocks spin (an animated X) until each reveals its symbol at 1s / 2s / 3s.
 */
export default function App() {
  const { credits, result, revealed, spinning, banked, loading, roll, cashout, newGame } =
    useSession()

  const inGame = credits !== null
  const busy = loading || spinning
  const canRoll = !busy && inGame && credits > 0
  const settled = !spinning && result !== null && revealed === 3

  /** What a single block shows: its revealed symbol, else a spinning X, else empty. */
  function blockFace(i: number) {
    if (result && i < revealed) return SYMBOL_EMOJI[result.symbols[i]]
    if (spinning) return <span className="animate-spin">✖</span>
    return '·'
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-bold tracking-tight">🎰 {APP_NAME}</h1>

      {inGame ? (
        <>
          <p className="text-lg">
            credits: <span className="font-mono font-bold">{credits}</span>
          </p>

          <div className="flex gap-3 text-5xl">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex h-20 w-20 items-center justify-center rounded bg-neutral-800"
              >
                {blockFace(i)}
              </span>
            ))}
          </div>

          {settled && (
            <p className="text-sm text-neutral-400">
              {result.win ? `You won ${result.reward}! 🎉` : 'No match.'}
            </p>
          )}

          {credits === 0 && settled && (
            <p className="text-sm text-red-400">Out of credits — cash out to bank your winnings.</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={roll}
              disabled={!canRoll}
              className="rounded bg-emerald-600 px-6 py-2 font-semibold disabled:opacity-40"
            >
              ROLL
            </button>
            <button
              onClick={cashout}
              disabled={busy}
              className="rounded bg-amber-600 px-6 py-2 font-semibold disabled:opacity-40"
            >
              CASH OUT
            </button>
          </div>
        </>
      ) : (
        <>
          {banked !== null && (
            <p className="text-lg text-emerald-400">
              Cashed out! Banked balance: <span className="font-mono font-bold">{banked}</span>
            </p>
          )}
          <button
            onClick={newGame}
            disabled={loading}
            className="rounded bg-emerald-600 px-6 py-2 font-semibold disabled:opacity-40"
          >
            NEW GAME
          </button>
        </>
      )}
    </main>
  )
}
