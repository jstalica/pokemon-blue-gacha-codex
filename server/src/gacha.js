const MAX_TICKETS = 3;
const RARITY_SEQUENCE = ["C", "U", "R", "E", "L"];

let seriesData = {};

function setSeriesData(data) {
  seriesData = data || {};
}

function getSeries(seriesId) {
  const series = seriesData[seriesId];
  if (!series) {
    throw new Error(`Unknown series id "${seriesId}"`);
  }
  return series;
}

function createInitialState(seriesIds = Object.keys(seriesData)) {
  const pity = {};
  const album = {};
  seriesIds.forEach((id) => {
    pity[id] = { pullsSinceEpic: 0, pullsSinceLegend: 0 };
    album[id] = {};
  });

  return {
    tickets: MAX_TICKETS,
    dust: 0,
    pity,
    album,
    history: []
  };
}

function getSeriesPity(state, seriesId) {
  const fallback = { pullsSinceEpic: 0, pullsSinceLegend: 0 };
  if (!state.pity) return fallback;
  return state.pity[seriesId] ?? fallback;
}

function getSeriesAlbum(state, seriesId) {
  if (!state.album) return {};
  return state.album[seriesId] ?? {};
}

function performPull(state, seriesId = "S1", options = {}) {
  if (!state) {
    throw new Error("Game state required");
  }
  if ((state.tickets ?? 0) <= 0) {
    throw new Error("No tickets remaining");
  }

  const rng = typeof options.rng === "function" ? options.rng : Math.random;
  const timestamp = options.timestamp ?? Date.now();
  const series = getSeries(seriesId);
  const pityBefore = getSeriesPity(state, seriesId);
  const albumBefore = getSeriesAlbum(state, seriesId);

  const baseRarity = rollRarity(series, rng);
  const finalRarity = applyPity(baseRarity, pityBefore);
  const item = rollItem(series, finalRarity, rng);
  const isDuplicate = Boolean(albumBefore[item.id]);
  const dustAwarded = isDuplicate ? dustFor(finalRarity) : 0;

  const nextPity = calculateNextPity(pityBefore, finalRarity);
  const nextTickets = Math.max(0, (state.tickets ?? 0) - 1);
  const nextDust = (state.dust ?? 0) + dustAwarded;
  const nextAlbum = {
    ...(state.album ?? {}),
    [seriesId]: {
      ...albumBefore,
      [item.id]: true
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

function dustFor(rarity) {
  return DUST_BY_RARITY[rarity] ?? 0;
}

const DUST_BY_RARITY = {
  C: 5,
  U: 15,
  R: 50,
  E: 200,
  L: 800
};

function rollRarity(series, rng) {
  const entries = RARITY_SEQUENCE.filter((rarity) => Boolean(series.rarities[rarity]))
    .map((rarity) => [rarity, series.rarities[rarity].rate]);

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
  const hardPityActive = (pityState.pullsSinceLegend ?? 0) >= 49;
  if (hardPityActive) {
    return "L";
  }

  const softEligible =
    (pityState.pullsSinceEpic ?? 0) >= 19 && baseRarity !== "E" && baseRarity !== "L";
  if (softEligible) {
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
    throw new Error(`Series "${series.seriesId}" has no items for rarity "${rarity}"`);
  }
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

function calculateNextPity(previous, rarity) {
  return {
    pullsSinceEpic: rarity === "E" || rarity === "L" ? 0 : (previous.pullsSinceEpic ?? 0) + 1,
    pullsSinceLegend: rarity === "L" ? 0 : (previous.pullsSinceLegend ?? 0) + 1
  };
}

function upgradeRarity(rarity) {
  const idx = RARITY_SEQUENCE.indexOf(rarity);
  if (idx === -1) return rarity;
  return RARITY_SEQUENCE[Math.min(idx + 1, RARITY_SEQUENCE.length - 1)];
}

module.exports = {
  MAX_TICKETS,
  RARITY_SEQUENCE,
  setSeriesData,
  getSeries,
  createInitialState,
  performPull,
  dustFor
};
