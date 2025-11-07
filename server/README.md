# Pokemon Blue Gacha Server

This is the Node.js/Express backend for the Pokemon Blue Gacha system.

## Getting started

1. Install dependencies (`npm install`).
2. Copy `.env.example` to `.env` and adjust as needed.
3. Start the development server (`npm run dev`) or production server (`npm start`).

The API exposes:

- `GET /api/health` – simple health check.
- `POST /api/pull` – returns a random Pokémon from the temporary starter pool.
