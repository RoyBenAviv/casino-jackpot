import type { HealthResponse } from '@casino/shared'

export function getHealth(): HealthResponse {
  return { ok: true, message: 'Healthy' }
}
