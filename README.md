# Pokemon Blue Gacha Prototype

Full-stack prototype for a Pokémon Blue-inspired gacha experience. The repository is split into a React client (`client/`) and an Express server (`server/`).

## Prerequisites

- Node.js 18+ (includes npm)

## Getting started

### Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The development server listens on port `4000` and exposes:

- `GET /api/health` — service health check
- `POST /api/pull` — returns a random Pokémon from the placeholder pool

### Frontend (`client/`)

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on port `5173` and proxies `/api/*` to the backend.

## Next steps

- Replace the hard-coded starter pool with real data.
- Add persistence layer (e.g., PostgreSQL, MongoDB, or Supabase).
- Implement authentication and player inventory management.
- Expand UI with history, probabilities, and pack animations.
