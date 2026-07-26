import { APP_NAME, SYMBOL_EMOJI } from '@casino/shared'
import { useSession } from './hooks/useSession'
import { CashOutButton } from './cmps/CashOutButton'

/** Shared gold button style (ROLL / NEW GAME). */
const GOLD_BUTTON =
  'rounded-lg bg-gradient-to-b from-amber-300 to-amber-500 px-8 py-2.5 font-bold tracking-wide text-emerald-950 shadow-lg shadow-amber-900/40 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'

/** A dark, gold-ringed panel that frames the machine and the cash-out screen. */
const PANEL =
  'flex flex-col items-center gap-6 rounded-2xl border border-amber-500/20 bg-black/30 px-10 py-9 shadow-2xl shadow-black/50 backdrop-blur'

/**
 * The slot machine: 3 blocks in a row, a ROLL and a CASH OUT button.
 * Blocks spin (an animated X) until each reveals its symbol at 1s / 2s / 3s.
 */
export default function App() {
  const { credits, result, revealed, spinning, banked, loading, error, roll, cashout, newGame } =
    useSession()

  const inGame = credits !== null
  const busy = loading || spinning
  const canRoll = !busy && inGame && credits > 0
  const settled = !spinning && result !== null && revealed === 3

  /** What a single block shows: its revealed symbol, else a spinning X, else a resting dot. */
  function blockFace(i: number) {
    if (result && i < revealed) return SYMBOL_EMOJI[result.symbols[i]]
    if (spinning) return <span className="animate-spin text-amber-400/70 [animation-duration:300ms]">✖</span>
    return <span className="text-amber-200/20">·</span>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-wide">
          🎰{' '}
          <span className="font-display bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-amber-200/40">
          the house always wins
        </p>
      </header>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      {inGame ? (
        <section className={PANEL}>
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-amber-200/60">credits</div>
            <div className="font-display text-4xl font-bold tabular-nums text-amber-300">
              {credits}
            </div>
          </div>

          <div className="flex gap-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex h-24 w-24 items-center justify-center rounded-xl border border-amber-400/20 bg-emerald-950/80 text-6xl shadow-inner shadow-black/60"
              >
                {blockFace(i)}
              </span>
            ))}
          </div>

          <div className="flex h-5 items-center text-sm">
            {settled &&
              (result.win ? (
                <span className="win-glow font-semibold text-amber-300">
                  You won {result.reward} credits! 🎉
                </span>
              ) : (
                <span className="text-neutral-400">No match.</span>
              ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={roll} disabled={!canRoll} className={GOLD_BUTTON}>
              ROLL
            </button>
            <CashOutButton credits={credits} disabled={busy} onClick={cashout} />
          </div>

          {credits === 0 && settled && (
            <p className="text-xs text-rose-300">Out of credits — cash out to bank your winnings.</p>
          )}
        </section>
      ) : (
        <section className={PANEL}>
          {banked !== null && (
            <p className="text-center text-amber-200">
              Cashed out!
              <br />
              <span className="font-display text-3xl font-bold text-amber-300">{banked}</span>
              <span className="ml-1 text-sm text-amber-200/60">banked</span>
            </p>
          )}
          <button onClick={newGame} disabled={loading} className={GOLD_BUTTON}>
            NEW GAME
          </button>
        </section>
      )}
    </main>
  )
}
