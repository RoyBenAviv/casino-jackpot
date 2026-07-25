import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the API at the module boundary — this smoke test cares about the
// bootstrap wiring, not the real network.
vi.mock('./services/api-service', () => ({
  apiService: {
    getCurrentSession: vi.fn().mockResolvedValue({ session: { id: 's1', credits: 10 } }),
    createSession: vi.fn(),
    roll: vi.fn(),
    cashout: vi.fn(),
  },
}))

describe('App (bootstrap smoke)', () => {
  it('renders the title and shows the credits from the rehydrated session', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /casino jackpot/i })).toBeInTheDocument()
    expect(await screen.findByText('10')).toBeInTheDocument()
  })
})
