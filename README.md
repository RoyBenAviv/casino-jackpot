# 🎰 Casino Jackpot

A full-stack slot machine where the house always wins.

The player starts a server-side session with **10 credits**. Each roll costs 1 credit; three matching symbols pay out (Cherry 10 · Lemon 20 · Orange 30 · Watermelon 40). The twist: once the player is winning, the server **secretly re-rolls winning rolls** (30% chance at 40–60 credits, 60% above 60) — and the CASH OUT button dodges the cursor using the **same probability bands**.

## Tech stack

TypeScript everywhere · Express 5 · React 19 + Vite + Tailwind · Vitest · npm-workspaces monorepo

## Getting started

Requires Node.js **>= 22**.

```bash
npm install     # once, at the root
npm run dev     # server on :3000 + client on :5173
```

Open http://localhost:5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | Server (`tsx watch`) + client (Vite) together |
| `npm test` | All Vitest suites |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm run build` | Production build (client → `client/dist`, server → `server/dist`) |

## Project structure

```
casino-jackpot/
├─ shared/   types & game constants used by BOTH sides
├─ server/   Express API — routes → controllers → services
└─ client/   React UI — views, cmps, services
```

`shared` is a local workspace package (never published) — `npm install` symlinks it, so server and client import the exact same source. It is the single source of truth for the API contract and the game rules: the dodging CASH OUT button and the server's cheat logic call the same function.

## How it works

- **All game logic lives on the server** — the client only expresses intent ("roll") and renders results. Never trust the client.
- The session id travels in an **httpOnly cookie**: invisible to JS (blunts XSS), survives refresh, sent automatically.
- **State is in-memory**, behind repository interfaces — the brief requires server-kept state, not persistence. Swapping in a real DB means implementing one interface.
- Every error uses one envelope: `{ error: { code, message } }`.
- In dev, the client (:5173) calls the API (:3000) with **CORS + credentials**; in production Express serves the built client from one origin and CORS becomes a no-op.
- `app.ts` builds the app, only `index.ts` listens — so tests drive the real app through Supertest without opening a port.

## Testing

One runner — **Vitest** — everywhere. Server endpoints via Supertest (no port), client components via React Testing Library (jsdom), game logic with an injected RNG so every "random" scenario is deterministic.

## Game rules & API

All endpoints live under `/api`; every error uses the envelope `{ error: { code, message } }`.

| Endpoint | Success | Errors |
| --- | --- | --- |
| `GET /api/health` | `200 { ok, message }` | — |
| `POST /api/sessions` | `201 { session: { id, credits: 10 } }` + httpOnly cookie | — |
| `GET /api/sessions/current` | `200 { session }` | `404 SESSION_NOT_FOUND` |
| `POST /api/sessions/current/rolls` | `200 { roll: { symbols, win, reward }, credits }` | `404` · `409 INSUFFICIENT_CREDITS` |
| `POST /api/sessions/current/cashout` | `200 { cashedOut, account: { balance } }` + closes session | `404` |

## Development journey

### Step 1 — Monorepo boilerplate

Started with a walking skeleton: three workspaces (`shared`/`server`/`client`) and one health check flowing through every layer before any game code.

- **Challenge:** cross-package TypeScript without build-order pain. **Solution:** `shared` is consumed as raw TS source; `tsc` only type-checks, tsup inlines `shared` into the production bundle.
- **Challenge:** session cookie across origins in dev. **Solution:** CORS with `credentials: true` + axios `withCredentials`.
- **Challenge:** testing Express without port conflicts. **Solution:** `app.ts` builds the app, only `index.ts` listens — Supertest runs the app in memory.

### Step 2 — Game domain in `shared`

The cheat logic is needed by both the server (secret re-roll) and the client (dodging CASH OUT button) — so `cheatChanceFor(credits)` lives once, in `shared`.

- **Challenge:** the brief doesn't say if 40 and 60 are inside the cheat band. **Solution:** decided `<40 → 0%`, `40–60 → 30%`, `>60 → 60%`, pinned by boundary tests at 39/40/60/61.
- **Challenge:** symbols and rewards drifting apart. **Solution:** the `SlotSymbol` type is derived from the `SYMBOLS` array — a symbol without a reward fails compilation.

### Step 3 — Sessions on the server

A session is `{ id, credits }` in server memory, identified only by an httpOnly cookie — the client holds no game state.

- **Challenge:** server-kept state without a database. **Solution:** an in-memory `Map` behind a `SessionRepository` interface — swapping in a real DB is one new implementation of that interface, nothing else changes.
- **Challenge:** consistent error responses from anywhere in the stack. **Solution:** a small `httpError(status, code, message)` helper — thrown in any controller/service, converted to the standard envelope by the error middleware (Express 5 forwards async throws automatically).

### Step 4 — The slot engine

Pure functions, no HTTP, no storage: `spin(rng)` draws 3 symbols, `resolveRoll(credits, rng)` applies the win check and the house cheat — if the first roll won, it may be secretly re-rolled once (chance from `cheatChanceFor`), and the re-roll stands either way. Losses are never re-rolled; the discarded roll never leaves the function.

- **Challenge:** testing logic built on randomness. **Solution:** randomness is injected (`Rng = () => number`), so tests pass a scripted rng (`[0, 0, 0, 0.1, ...]`) and every scenario — win, cheated win, re-rolled win that still pays — becomes exact and repeatable.

### Step 5 — The roll endpoint

`POST /api/sessions/current/rolls` connects the engine to a session: guard the session exists (`404`) and has credits (`409`), deduct the cost, run `resolveRoll` on the **post-cost** balance, bank any reward, persist, and return `{ roll, credits }`.

- **Challenge:** the endpoint is random, but its tests must be exact. **Solution:** the `rng` is injected into the app (`buildApp({ rng })`, read from `app.locals`) — production defaults to `Math.random`, tests pass a scripted one, so a full HTTP round-trip can assert exact symbols and credits.
- **Interpretation decision:** the cheat band is evaluated on credits **after** the 1-credit cost — the balance the roll is actually played on.

### Step 6 — Cash out + account

`POST /api/sessions/current/cashout` moves the session's credits into an account, then closes the session.

- **Challenge:** the brief mentions a "user account" but has no login. **Solution:** an anonymous, long-lived `accountId` cookie — cashed-out credits accumulate across sessions without inventing an auth system. Swapping the anonymous id for a real user id is a one-line change.
- Same in-memory-behind-an-interface pattern as sessions (`AccountRepository`).

### Step 7 — Connecting the client

The React client now plays the full loop. A `useSession` hook bootstraps on mount (`GET /current`, falling back to `POST` a new session), and exposes `roll`/`cashout` actions.

- **Challenge:** the client must never hold game truth. **Solution:** every credit value shown comes straight from a server response; the hook only mirrors what the server returns.
- The UI here is intentionally plain — the animated reveal and the dodging CASH OUT button come next.
