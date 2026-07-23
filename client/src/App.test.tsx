import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the API layer at the module boundary — this smoke test cares about
// rendering, not about which HTTP client the service uses.
vi.mock('./services/api-service', () => ({
  apiService: {
    getHealth: vi.fn().mockResolvedValue({ ok: true, message: 'Healthy' }),
  },
}))

describe('App (boilerplate smoke)', () => {
  it('renders the title and reports the server as reachable', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /casino jackpot/i })).toBeInTheDocument()
    expect(await screen.findByText('ok')).toBeInTheDocument()
  })
})
