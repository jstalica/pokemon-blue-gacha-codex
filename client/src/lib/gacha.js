import series1 from "../data/pools/series1.json";
import series2 from "../data/pools/series2.json";

const MAX_TICKETS = 3;
const RARITY_SEQUENCE = ["C", "U", "R", "E", "L"];

const SERIES_DATA = {
  [series1.seriesId]: series1,
  [series2.seriesId]: series2
};

const DUST_BY_RARITY = {
  C: 5,
  U: 15,
  R: 50,
  E: 200,
  L: 800
};

const CRAFT_MULTIPLIER = 10;
const SET_BONUS_TEMPLATE = {
  badgeName: "Mint Memory",
  reward: "DMG Shell Tint"
};

/**
 * Initialize a fresh save state seeded with all known series.
 */
export function createInitialState(seriesIds = Object.keys(SERIES_DATA)) {
  const pity = {};
  const album = {};
  const setBonus = {};
  seriesIds.forEach((id) => {
    pity[id] = { pullsSinceEpic: 0, pullsSinceLegend: 0 };
    album[id] = {};
    setBonus[id] = { unlocked: false };
  });

  return {
    tickets: MAX_TICKETS,
    dust: 0,
    pity,
    album,
    setBonus,
    history: []
  };
}

/**
 * Returns series data by id, throwing if it does not exist.
 */
export function getSeries(seriesId) {
  const series = SERIES_DATA[seriesId];
  if (!series) {
    throw new Error(`Unknown series id "${seriesId}"`);
  }
  return series;
}

/**
 * Provides a safe pity shape for a given series without mutating the input state.
 */
function getSeriesPity(state, seriesId) {
  const fallback = { pullsSinceEpic: 0, pullsSinceLegend: 0 };
  if (!state.pity) return fallback;
  return state.pity[seriesId] ?? fallback;
}

/**
 * Provides a safe album dictionary for a given series without mutating the input state.
 */
function getSeriesAlbum(state, seriesId) {
  if (!state.album) return {};
  return state.album[seriesId] ?? {};
}

/**
 * Generates a pull result, returning the updated state and metadata.
 * The function is pure; it does not mutate the provided state.
 */
export function performPull(state, seriesId = "S1", options = {}) {
  if (!state) {
    throw new Error("Game state required");
  }
  if (state.tickets <= 0) {
    throw new Error("No tickets remaining");
  }

  const rng = typeof options.rng === "function" ? options.rng : Math.random;
  const timestamp = options.timestamp ?? Date.now();
  const series = getSeries(seriesId);
  const pityBefore = getSeriesPity(state, seriesId);
  const albumBefore = getSeriesAlbum(state, seriesId);
  const bonusState = state.setBonus?.[seriesId] ?? { unlocked: false };

  const baseRarity = rollRarity(series, rng);
  const finalRarity = applyPity(baseRarity, pityBefore);
  const item = rollItem(series, finalRarity, rng);
  const isDuplicate = Boolean(albumBefore[item.id]);
  const dustAwarded = isDuplicate ? dustFor(finalRarity) : 0;

  const nextPity = calculateNextPity(pityBefore, finalRarity);
  const nextTickets = Math.max(0, state.tickets - 1);
  const nextDust = state.dust + dustAwarded;
  const nextAlbum = {
    ...(state.album ?? {}),
    [seriesId]: {
      ...albumBefore,
      [item.id]: true
    }
  };

  const seriesCompleted = Object.keys(nextAlbum[seriesId]).length === series.items.length;
  const setBonusEntry = {
    ...(state.setBonus ?? {}),
    [seriesId]: {
      unlocked: bonusState.unlocked || seriesCompleted,
      badgeName: series.setBonus?.badgeName ?? SET_BONUS_TEMPLATE.badgeName,
      reward: series.setBonus?.reward ?? SET_BONUS_TEMPLATE.reward
    }
  };

  const nextHistory = [
    ...(state.history ?? []),
    {
      action: "pull",
      seriesId,
      itemId: item.id,
      rarity: finalRarity,
      duplicate: isDuplicate,
      dustAwarded,
      timestamp
    }
  ];

  return {
    state: {
      ...state,
      tickets: nextTickets,
      dust: nextDust,
      pity: {
        ...(state.pity ?? {}),
        [seriesId]: nextPity
      },
      album: nextAlbum,
      setBonus: setBonusEntry,
      history: nextHistory
    },
    result: {
      item,
      rarity: finalRarity,
      duplicate: isDuplicate,
      dustAwarded,
      pityBefore,
      pityAfter: nextPity,
      ticketsBefore: state.tickets,
      ticketsAfter: nextTickets
    }
  };
}

/**
 * Adds the provided amount of tickets, respecting the maximum storage cap.
 */
export function addTickets(state, amount) {
  if (amount <= 0) return state;
  const nextTickets = Math.min(MAX_TICKETS, (state.tickets ?? 0) + amount);
  return { ...state, tickets: nextTickets };
}

/**
 * Clears local progress for debugging while keeping series definitions.
 */
export function resetProgress(state, seriesIds = Object.keys(SERIES_DATA)) {
  const fresh = createInitialState(seriesIds);
  return {
    ...fresh,
    tickets: fresh.tickets,
    dust: fresh.dust,
    pity: fresh.pity,
    album: fresh.album,
    setBonus: fresh.setBonus,
    history: []
  };
}

/**
 * Returns dust reward for a given rarity.
 */
export function dustFor(rarity) {
  return DUST_BY_RARITY[rarity] ?? 0;
}

export function craftCostFor(rarity) {
  return dustFor(rarity) * CRAFT_MULTIPLIER;
}

export function craftItem(state, seriesId, itemId) {
  if (!state) {
    throw new Error("Game state required");
  }
  const series = getSeries(seriesId);
  const albumBefore = getSeriesAlbum(state, seriesId);
  if (albumBefore[itemId]) {
    return {
      state,
      result: { crafted: false, reason: "already-owned" }
    };
  }

  const item = series.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Item "${itemId}" not found in series ${seriesId}`);
  }

  const cost = craftCostFor(item.rarity);
  if ((state.dust ?? 0) < cost) {
    throw new Error("Not enough dust to craft this item");
  }

  const nextAlbum = {
    ...(state.album ?? {}),
    [seriesId]: {
      ...albumBefore,
      [itemId]: true
    }
  };

  const nextHistory = [
    ...(state.history ?? []),
    {
      action: "craft",
      seriesId,
      itemId,
      rarity: item.rarity,
      dustSpent: cost,
      timestamp: Date.now()
    }
  ];

  return {
    state: {
      ...state,
      dust: (state.dust ?? 0) - cost,
      album: nextAlbum,
      history: nextHistory
    },
    result: {
      crafted: true,
      item,
      cost
    }
  };
}

function rollRarity(series, rng) {
  const entries = RARITY_SEQUENCE.filter((rarity) =>
    Boolean(series.rarities[rarity])
  ).map((rarity) => [rarity, series.rarities[rarity].rate]);

  const total = entries.reduce((sum, [, rate]) => sum + rate, 0);
  if (total <= 0) {
    throw new Error(`Series "${series.seriesId}" has invalid rarity rates`);
  }

  const roll = rng();
  let cumulative = 0;
  for (const [rarity, rate] of entries) {
    cumulative += rate / total;
    if (roll <= cumulative) {
      return rarity;
    }
  }
  return entries[entries.length - 1][0];
}

function applyPity(baseRarity, pityState) {
  const hardPityActive = pityState.pullsSinceLegend >= 49;
  if (hardPityActive) {
    return "L";
  }

  const softPityEligible =
    pityState.pullsSinceEpic >= 19 && baseRarity !== "E" && baseRarity !== "L";
  if (softPityEligible) {
    const upgraded = upgradeRarity(baseRarity);
    const epicIndex = RARITY_SEQUENCE.indexOf("E");
    const upgradedIndex = RARITY_SEQUENCE.indexOf(upgraded);
    if (epicIndex !== -1 && upgradedIndex < epicIndex) {
      return "E";
    }
    return upgraded;
  }
  return baseRarity;
}

function rollItem(series, rarity, rng) {
  const candidates = series.items.filter((item) => item.rarity === rarity);
  if (candidates.length === 0) {
    throw new Error(
      `Series "${series.seriesId}" has no items for rarity "${rarity}"`
    );
  }
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

function calculateNextPity(previous, rarity) {
  return {
    pullsSinceEpic: rarity === "E" || rarity === "L" ? 0 : previous.pullsSinceEpic + 1,
    pullsSinceLegend: rarity === "L" ? 0 : previous.pullsSinceLegend + 1
  };
}

function upgradeRarity(rarity) {
  const idx = RARITY_SEQUENCE.indexOf(rarity);
  if (idx === -1) return rarity;
  return RARITY_SEQUENCE[Math.min(idx + 1, RARITY_SEQUENCE.length - 1)];
}

export { MAX_TICKETS, RARITY_SEQUENCE, SERIES_DATA };
