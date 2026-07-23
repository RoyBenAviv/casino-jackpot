import { useEffect, useState } from 'react'
import { APP_NAME } from '@casino/shared'
import { apiService } from './services/api-service'

type ServerStatus = 'checking' | 'ok' | 'unreachable'

/**
 * Boilerplate shell: renders the app title and proves the client → proxy →
 * server pipe by calling /api/health. The slot machine arrives in later
 * milestones.
 */
export default function App() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')

  useEffect(() => {
    let cancelled = false
    apiService
      .getHealth()
      .then(({ ok }) => {
        if (!cancelled) setServerStatus(ok ? 'ok' : 'unreachable')
      })
      .catch(() => {
        if (!cancelled) setServerStatus('unreachable')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-100">
      <h1 className="text-4xl font-bold tracking-tight">🎰 {APP_NAME}</h1>
      <p className="text-sm text-neutral-400">
        server:{' '}
        <span className={serverStatus === 'ok' ? 'text-green-400' : 'text-amber-400'}>
          {serverStatus}
        </span>
      </p>
    </main>
  )
}
