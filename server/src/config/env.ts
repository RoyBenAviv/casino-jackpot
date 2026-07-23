/**
 * All environment access lives here — the rest of the code imports `env`
 * and never touches `process.env` directly.
 */
export const env = {
  port: Number(process.env.PORT ?? 3000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
} as const
