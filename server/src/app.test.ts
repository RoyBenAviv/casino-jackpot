import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { buildApp } from './app'

describe('app (boilerplate smoke)', () => {
  it('GET /api/health returns ok through all layers', async () => {
    const res = await request(buildApp()).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, message: 'Healthy' })
  })

  it('unknown routes return the standard 404 error envelope', async () => {
    const res = await request(buildApp()).get('/api/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(typeof res.body.error.message).toBe('string')
  })
})
