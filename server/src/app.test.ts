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

describe('sessions', () => {
  it('POST /api/sessions starts a session with 10 credits and sets an httpOnly cookie', async () => {
    const res = await request(buildApp()).post('/api/sessions')

    expect(res.status).toBe(201)
    expect(res.body.session.credits).toBe(10)
    expect(res.headers['set-cookie'][0]).toContain('sessionId=')
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly')
  })

  it('GET /api/sessions/current without a cookie returns the 404 envelope', async () => {
    const res = await request(buildApp()).get('/api/sessions/current')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('SESSION_NOT_FOUND')
  })

  it('GET /api/sessions/current with the cookie returns the same session (refresh survives)', async () => {
    const agent = request.agent(buildApp())
    const created = await agent.post('/api/sessions')
    const res = await agent.get('/api/sessions/current')

    expect(res.status).toBe(200)
    expect(res.body.session).toEqual(created.body.session)
  })
})
