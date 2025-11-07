# Implementation Plan – Pokémon Blue Gacha Prototype

This document translates the design brief into concrete engineering work across the current React (client) and Express (server) codebases.

## Data & Content

- [x] Add JSON pool data per series under `server/pools/` (or share via `client/src/data/` if kept client-side).
- [x] Encode rarity tables, pity thresholds, dust payout, and crafting costs using typed structures.
- [x] Include seed data for Series 1 (`S1`) with 9+ collectibles and sample field modifiers.
- [x] Add Series 2 (`S2`) pool definition with sprites and descriptions.

## Backend (Optional Enhancements)

- [x] Serve static pool JSON via `/api/pools/:seriesId`.
- [x] Provide `/api/pull` that accepts client state (tickets, pity counters) and returns a deterministic result for testing.
- [x] Keep logic deterministic by allowing an override seed/query param.

_Note: For a purely front-end prototype these endpoints can be skipped; we now support both paths._

## Frontend Architecture

- [x] Move to a view-state router (`Home`, `Kiosk`, `Reveal`, `Album`, `FieldModifiers`, `Odds`).
- [x] Centralize game state (tickets, pity by series, album completion, dust) in a context or state manager, persisted to `localStorage`.
- [x] Implement pull flow that:
  - Checks ticket availability / cap (3).
  - Applies pity rules (soft/hard).
  - Awards dust for duplicates and updates craft progress.
  - Records reveals with timestamp for history.
- [x] Add reveal animation timing (200–600 ms segments) with skip control.

## UI/UX Elements

- [x] DMG-inspired styling (limited palette, pixel font, scanline effect optional).
- [x] Kiosk screen: machine art placeholder, ticket balance, pull CTA, odds + pity indicator.
- [x] Reveal screen: capsule animation, rarity badge, duplication toast, dust update.
- [x] Album screen: series grid (3×3), completion rewards, craft button using dust.
- [x] Field Modifiers screen: simple encounter table visualization reacting to active modifier.
- [x] Odds modal: communicates rarity distribution & pity mechanics.
- [x] Debug/reset panel for testing (ticket refill, clear storage).

## Testing & Tooling

- [ ] Provide utility helpers for RNG, pity logic, and dust calculations with unit tests (e.g., Vitest).
- [ ] Add lint/format scripts if time permits.

## Deliverables Checklist

- [ ] Prototype build instructions (`README.md` already covers basics, expand if needed).
- [ ] Capture key UI flows (static images or record instructions).
- [ ] Update `docs/DESIGN.md` as implementation evolves.
