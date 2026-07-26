import { useRef, useState } from 'react'
import { cheatChanceFor } from '@casino/shared'

/** After a dodge, hold still this long — the window the player can land a click in. */
const DODGE_COOLDOWN_MS = 400

interface CashOutButtonProps {
  credits: number
  disabled: boolean
  onClick: () => void
}

/**
 * The twist: this button dodges the cursor using the SAME probability bands the
 * server cheats with — `cheatChanceFor(credits)` (0% under 40 credits, 30% at
 * 40–60, 60% above). It re-rolls the dodge on every pointer movement over it, so
 * the richer the player, the more the cursor has to chase it. Keyboard users are
 * never dodged — these are mouse events — so the button stays fully accessible
 * (Tab + Enter always works).
 */
export function CashOutButton({ credits, disabled, onClick }: CashOutButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const nextDodgeAt = useRef(0)

  function dodgeIfUnlucky() {
    if (Date.now() < nextDodgeAt.current) return // still cooling down — hold still, catchable
    if (Math.random() < cheatChanceFor(credits)) {
      // Leap to a random point on a ring around home — bounded, never drifts off-screen.
      const angle = Math.random() * 2 * Math.PI
      const distance = 160 + Math.random() * 140 // 160–300px
      setOffset({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance })
      nextDodgeAt.current = Date.now() + DODGE_COOLDOWN_MS
    }
  }

  function handleClick() {
    setOffset({ x: 0, y: 0 })
    onClick()
  }

  return (
    <button
      onPointerEnter={dodgeIfUnlucky}
      onPointerMove={dodgeIfUnlucky}
      onClick={handleClick}
      disabled={disabled}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: 'transform 120ms' }}
      className="rounded-lg bg-gradient-to-b from-rose-500 to-rose-700 px-8 py-2.5 font-bold tracking-wide text-white shadow-lg shadow-rose-950/40 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      CASH OUT
    </button>
  )
}
