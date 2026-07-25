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

describe('rolls', () => {
  it('a winning roll deducts the cost and banks the reward', async () => {
    // 10 credits → pay 1 → 9 → watermelon×3 (rng .75×3) → no cheat below 40 → +40 → 49
    const agent = request.agent(buildApp({ rng: () => 0.75 }))
    await agent.post('/api/sessions')
    const res = await agent.post('/api/sessions/current/rolls')

    expect(res.status).toBe(200)
    expect(res.body.roll).toEqual({
      symbols: ['watermelon', 'watermelon', 'watermelon'],
      win: true,
      reward: 40,
    })
    expect(res.body.credits).toBe(49)
  })

  it('rolling with no session returns 404', async () => {
    const res = await request(buildApp()).post('/api/sessions/current/rolls')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('SESSION_NOT_FOUND')
  })

  it('rolling at 0 credits returns 409', async () => {
    // always draw cherry/lemon/orange → a loss every roll, so credits only drain
    const draws = [0, 0.25, 0.5]
    let i = 0
    const agent = request.agent(buildApp({ rng: () => draws[i++ % 3] }))
    await agent.post('/api/sessions')
    for (let n = 0; n < 10; n++) await agent.post('/api/sessions/current/rolls') // 10 → 0
    const res = await agent.post('/api/sessions/current/rolls')

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('INSUFFICIENT_CREDITS')
  })
})

describe('cashout', () => {
  it('banks the session credits, closes the session, and refuses a second cashout', async () => {
    const agent = request.agent(buildApp())
    await agent.post('/api/sessions') // 10 credits

    const res = await agent.post('/api/sessions/current/cashout')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ cashedOut: 10, account: { balance: 10 } })

    // session is now closed → cashing out again has nothing to bank
    const again = await agent.post('/api/sessions/current/cashout')
    expect(again.status).toBe(404)
  })

  it('accumulates credits across sessions into the same account', async () => {
    const agent = request.agent(buildApp())

    await agent.post('/api/sessions')
    await agent.post('/api/sessions/current/cashout') // balance 10

    await agent.post('/api/sessions') // fresh 10-credit session, same account cookie
    const res = await agent.post('/api/sessions/current/cashout')

    expect(res.body.account.balance).toBe(20)
  })
})
