# Pokémon Blue Gacha – Prototype & Brief

> Goal: Deliver a functional web prototype plus a crisp 1–2 page brief that explains the feature, why it works, how it’s balanced, and how you built it.

---

## 1) Core Concept (What it adds)

**Kanto Capsule Machines** — retro capsule kiosks placed in Poké Centers and Poké Marts that dispense **non-power** collectibles and light utility “field modifiers” that **don’t make battles easier**, but **change how the world feels**.

* **Fidelity:** Game Boy (DMG) era look, 2–3 color palette with chunky pixels.
* **Where:** New kiosk NPC and a gumball-style machine sprite near the Shop counter.
* **Loop:** Earn “Tickets” from normal play → use at kiosk → reveal capsule → collect cosmetic/field modifier → album completion goals → pity/crafting to reduce RNG pain.

**Why not pay-to-win:** No stat boosts, no rare TMs, no IV/EV effects. Field modifiers only change **who appears** (encounter tables) or **how the world looks/sounds** for a short time.

> **Explanation for non-Pokémon players:**
>
> * **TMs (Technical Machines)** are items that teach Pokémon powerful new moves, like “Thunderbolt” or “Surf.” Some are rare and can make a team much stronger.
> * **IVs and EVs (Individual Values and Effort Values)** are hidden systems that determine a Pokémon’s potential and how its stats grow through training. They affect attack, defense, speed, and other attributes.
> * By excluding these from the gacha, players can’t gain combat advantages, ensuring the feature remains fair and cosmetic.

---

## 2) Player Motivation (Why engage)

* **Collection Completion:** Sticker album per capsule “Series” (Viridian, Mt. Moon, Celadon, etc.).
* **Expression:** Trainer card frames, bike skins, follower PokéDoll (purely cosmetic), battle intro filters.
* **Discovery:** Field modifiers (e.g., **Bug Lure 10m**: increases bug encounters on routes with bugs) create **micro-quests** without altering power.
* **Mastery Over RNG:** Pity and crafting dust (from dupes) let players aim toward targets.

---

## 3) Mechanics (Economy, pools, progression)

**Currencies**

* **Tickets (free):** 1 from Gym badge, 1–2 from story beats, daily kiosk stamp, and side tasks (e.g., catching contest). Cap: 3 stored; pushes regular, not binge, usage.
* **Coins (optional/premium):** If needed for live product, map to Game Corner coins; here, keep the prototype focused on **Tickets**.
* **Dust:** Auto-granted from dupes; craft any cosmetic (cost scales by rarity).

**Rarity & Base Rates**

* Common 60%
* Uncommon 25%
* Rare 10%
* Epic 4%
* Legendary 1%

**Pity**

* **Soft pity:** If last 19 pulls < Epic, next pull upgraded by one tier.
* **Hard pity:** Guarantee **Legendary** at 50 pulls lifetime per Series.

**Series Unlocks (progression integration)**

* Series 1: Pallet–Pewter
* Series 2: Mt. Moon–Cerulean
* Series 3: Vermilion–Rock Tunnel
* Series 4: Celadon–Saffron
* Series 5: Fuchsia–Cinnabar
* Series 6: Victory Road–Indigo

**Reward Types**

* **Cosmetics:** Trainer card frames; bike skins; follower PokéDoll; battle intro filter; GB chiptune SFX swaps.
* **Field Modifiers (10 min, world map only):** Bug/Lake/Grass/Nocturnal Lures → **shift encounter weights** but never spawn otherwise impossible Pokémon. No stack with Repel.
* **Albums & Sets:** Completing a 9-slot set grants an animated badge (cosmetic).

**Dupe Handling → Dust**

* C: 5 dust, U: 15, R: 50, E: 200, L: 800. Crafting target = 10× tier dust.

---

## 4) Balance & Ethics (No P2W)

* **Strict power firewall:** No stats, no TMs, no held items, no move edits.

> **Explanation for non-Pokémon players:**
>
> * **Stats** are the numerical values that define how strong a Pokémon is in battle (attack, defense, speed, etc.).
> * **TMs** are single-use items that teach new moves, often strong or rare.
> * **Held items** are accessories that give bonuses in fights.
> * **Move edits** would mean changing a Pokémon’s attack list to make it stronger.
> * By blocking all of these, the gacha system cannot influence combat — only visuals or exploration.

* **Session pacing:** Ticket cap (3) and daily stamp nudge sustainable daily return.
* **Player agency:** Visible pity meter and dust crafting progress bar.
* **Transparent rates:** Display pool and exact odds in-game.

---

## 5) Prototype Scope (Web demo you can ship fast)

**Pages**

1. **Home** (DMG-styled): Start, Continue.
2. **Kiosk**: Machine, Ticket balance, odds button, pull CTA.
3. **Reveal**: Capsule drop → shake → crack → reward card with rarity.
4. **Album**: Series grid (9 slots), set bonuses, dust & craft button.
5. **Field Modifiers**: Simple Route preview mock (encounter weights change when a lure is active). No combat.

**Interactions**

* Pull animation (200–600ms phases). Skip button.
* Pity meter updates after reveal.
* Dupe → dust toast → craft progress increments.

**Tech**

* **Static site** (initial concept) or **current stack** (React + Express) for richer prototyping.
* **JSON pools** per series: `pools/series1.json` etc.
* **LocalStorage** for state: tickets, pity counters, album.
* **Pixel font** + 2–3 color palette.

---

## 6) JSON Pool Example (`/pools/series1.json`)

```json
{
  "seriesId": "S1",
  "name": "Pallet–Pewter",
  "rarities": {
    "C": { "rate": 0.60 },
    "U": { "rate": 0.25 },
    "R": { "rate": 0.10 },
    "E": { "rate": 0.04 },
    "L": { "rate": 0.01 }
  },
  "items": [
    { "id": "frame_oak", "name": "Trainer Frame: Oak", "type": "cosmetic", "rarity": "C" },
    { "id": "bike_red", "name": "Bike Skin: Red", "type": "cosmetic", "rarity": "U" },
    { "id": "lure_bug_10", "name": "Bug Lure (10m)", "type": "field_modifier", "rarity": "R", "modifier": { "table": "bug", "durationSec": 600 } },
    { "id": "follower_pokedoll_pikachu", "name": "Follower PokéDoll: Pikachu", "type": "cosmetic", "rarity": "E" },
    { "id": "intro_filter_indigo", "name": "Battle Intro: Indigo Filter", "type": "cosmetic", "rarity": "L" }
  ]
}
```

---

## 7) JS Logic Sketch (`main.js` concept)

```js
// State
const state = JSON.parse(localStorage.getItem("save")) || {
  tickets: 3,
  pity: { S1: { pullsSinceEpic: 0, pullsSinceLegend: 0 } },
  album: { S1: {} },
  dust: 0
};

async function pull(seriesId = "S1") {
  if (state.tickets <= 0) return toast("No tickets.");
  state.tickets--;
  const pool = await fetch(`/pools/${seriesId}.json`).then(r => r.json());
  const rarity = rollRarity(pool, state.pity[seriesId]);
  const item = rollItem(pool, rarity);
  const duped = Boolean(state.album[seriesId][item.id]);
  if (duped) state.dust += dustFor(rarity);
  state.album[seriesId][item.id] = true;
  updatePity(seriesId, rarity);
  save();
  showReveal(item, rarity, duped);
}
```

---

## 8) Visual Assets (quick list)

* 1 kiosk sprite (front-facing) + NPC clerk.
* Capsule + crack frames (3–4).
* Rarity border frames (C/U/R/E/L) with subtle flourish.
* Album page grid (3×3) per Series.
* Pixel font, 2–3 color palette.

---

## 9) Brief (1–2 pages) – Outline

1. **Core Concept:** Why capsule machines fit Kanto; what changes for the player.
2. **Player Motivation:** Collection, expression, discovery, mastery over RNG.
3. **Mechanics:** Currencies, pools, pity, dupes → dust, Series gating.
4. **Balance:** No P2W, ticket cap, transparency, agency.
5. **AI Tools Used:** Copilot, ChatGPT for JSON scaffolds and copy; Figma AI for sprites; etc.
6. **Iteration:** Pool trims after playtest; pity tuning after completion distribution review.
7. **Next Steps:** Usability test (5 users), telemetry, balance knobs, expand Series 2.

---

## 10) Usability & Validation Plan

* **5-user task study:** Can players find the kiosk? Understand odds? Explain pity?
* **2-day diary:** Do they return when tickets refill? What do they seek to craft?
* **Telemetry:** Pulls/day, pity activations, dupes rate, dust craft time, album completion time.

---

## 11) Shipping Checklist (turn into GitHub issues)

* [ ] Repo scaffolding: `/pools`, `/img`, `/css`, `/js`.
* [ ] Implement state & pull logic (with pity & dupes → dust).
* [ ] Build **Kiosk** page UI + odds modal.
* [ ] Build **Reveal** animation (skip-able).
* [ ] Build **Album** with set bonuses view.
* [ ] Build **Field Modifiers** demo route (weights shift UI only).
* [ ] Add accessibility: keyboard controls + screen reader labels.
* [ ] Add **Rates** disclosure + pity meter UI.
* [ ] Add localStorage reset/debug panel.
* [ ] Prepare 1–2 minute capture or GIF of the flow.

---

## 12) Submission Packaging

* **Prototype link:** GitHub Pages / Netlify (static).
* **Brief:** Export this doc as a 2-page PDF.
* **Visuals:** 3–5 screens (Kiosk, Reveal, Album, Field Modifiers, Odds).

---

## 13) Appendix – Odds Disclosure Block (UI copy)

> Series S1 (Pallet–Pewter) base odds: C 60% | U 25% | R 10% | E 4% | L 1%  
> Pity: Guaranteed Epic or better within 20 pulls; guaranteed Legendary within 50 pulls.  
> Duplicates convert into Dust used to craft target cosmetics. No items affect Pokémon stats, moves, or battle outcomes.
