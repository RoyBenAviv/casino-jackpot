import axios from 'axios'
import type { HealthResponse } from '@casino/shared'

// Send the session cookie on every request (the API lives on another origin in dev).
axios.defaults.withCredentials = true

// Same origin in production (Express serves the built client); the local dev server otherwise.
const domain = import.meta.env.PROD ? '' : 'http://localhost:3000'

export const apiService = {
  getHealth,
}

async function getHealth(): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>(`${domain}/api/health`)
  return data
}
