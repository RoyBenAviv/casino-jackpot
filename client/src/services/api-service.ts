import axios from 'axios'
import type { CashoutResponse, RollResponse, SessionResponse } from '@casino/shared'

// Send the session/account cookies on every request (the API is another origin in dev).
axios.defaults.withCredentials = true

// Same origin in production (Express serves the built client); the local dev server otherwise.
const domain = import.meta.env.PROD ? '' : 'http://localhost:3000'

export const apiService = {
  getCurrentSession,
  createSession,
  roll,
  cashout,
}

async function getCurrentSession(): Promise<SessionResponse> {
  const { data } = await axios.get<SessionResponse>(`${domain}/api/sessions/current`)
  return data
}

async function createSession(): Promise<SessionResponse> {
  const { data } = await axios.post<SessionResponse>(`${domain}/api/sessions`)
  return data
}

async function roll(): Promise<RollResponse> {
  const { data } = await axios.post<RollResponse>(`${domain}/api/sessions/current/rolls`)
  return data
}

async function cashout(): Promise<CashoutResponse> {
  const { data } = await axios.post<CashoutResponse>(`${domain}/api/sessions/current/cashout`)
  return data
}
