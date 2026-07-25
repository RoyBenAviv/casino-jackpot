import { APP_NAME, SYMBOL_LETTERS } from '@casino/shared'
import { useSession } from './hooks/useSession'

/**
 * Plain playable shell: shows credits, lets the player roll and cash out.
 * The animated slot-machine reveal and the dodging CASH OUT button arrive
 * in later milestones — this proves the full client → server game loop.
 */
export default function App() {
  const { credits, lastRoll, banked, busy, roll, cashout, newGame } = useSession()

  const inGame = credits !== null
  const canRoll = !busy && inGame && credits > 0

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-bold tracking-tight">🎰 {APP_NAME}</h1>

      {inGame ? (
        <>
          <p className="text-lg">
            credits: <span className="font-mono font-bold">{credits}</span>
          </p>

          <div className="flex gap-3 text-5xl font-mono">
            {(lastRoll?.symbols ?? ['-', '-', '-']).map((s, i) => (
              <span
                key={i}
                className="flex h-20 w-20 items-center justify-center rounded bg-neutral-800"
              >
                {s in SYMBOL_LETTERS ? SYMBOL_LETTERS[s as keyof typeof SYMBOL_LETTERS] : '-'}
              </span>
            ))}
          </div>

          {lastRoll && (
            <p className="text-sm text-neutral-400">
              {lastRoll.win ? `You won ${lastRoll.reward}! 🎉` : 'No match.'}
            </p>
          )}

          {credits === 0 && (
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
            disabled={busy}
            className="rounded bg-emerald-600 px-6 py-2 font-semibold disabled:opacity-40"
          >
            NEW GAME
          </button>
        </>
      )}
    </main>
  )
}
