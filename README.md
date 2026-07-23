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

_(Coming with the game milestones — endpoints, request/response shapes, and the documented interpretation decisions for the cheat logic.)_
