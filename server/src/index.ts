import { buildApp } from './app'
import { env } from './config/env'

buildApp().listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`)
})
