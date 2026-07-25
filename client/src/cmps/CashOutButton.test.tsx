import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CashOutButton } from './CashOutButton'

afterEach(() => vi.restoreAllMocks())

describe('CashOutButton', () => {
  it('dodges the cursor when the player is rich (high cheat band)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // 0 < cheatChanceFor(100)=0.6 → dodge
    render(<CashOutButton credits={100} disabled={false} onClick={() => {}} />)

    const button = screen.getByRole('button', { name: /cash out/i })
    expect(button.style.transform).toBe('translate(0px, 0px)')

    fireEvent.pointerEnter(button)
    expect(button.style.transform).not.toBe('translate(0px, 0px)') // it jumped away
  })

  it('never dodges below 40 credits', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<CashOutButton credits={10} disabled={false} onClick={() => {}} />)

    const button = screen.getByRole('button', { name: /cash out/i })
    fireEvent.pointerEnter(button)
    expect(button.style.transform).toBe('translate(0px, 0px)') // cheatChanceFor(10)=0 → stays put
  })
})
