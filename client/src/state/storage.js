import { createInitialState, MAX_TICKETS, SERIES_DATA } from "../lib/gacha";

const STORAGE_KEY = "pokemon-blue-gacha-save-v1";

export function loadGameState() {
  if (typeof window === "undefined") {
    return createInitialState(Object.keys(SERIES_DATA));
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState(Object.keys(SERIES_DATA));
    }
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn("Failed to load save data, starting fresh", error);
    return createInitialState(Object.keys(SERIES_DATA));
  }
}

export function saveGameState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist save data", error);
  }
}

export function clearGameState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function mergeWithDefaults(saved) {
  const defaults = createInitialState(Object.keys(SERIES_DATA));

  const tickets = clampNumber(saved?.tickets ?? defaults.tickets, 0, MAX_TICKETS);
  const dust = Math.max(0, saved?.dust ?? defaults.dust);

  const pity = {};
  const album = {};
  const setBonus = {};
  const seriesIds = Object.keys(SERIES_DATA);

  seriesIds.forEach((seriesId) => {
    const savedPity = saved?.pity?.[seriesId] ?? {};
    pity[seriesId] = {
      pullsSinceEpic: clampNumber(savedPity.pullsSinceEpic ?? 0, 0, 999),
      pullsSinceLegend: clampNumber(savedPity.pullsSinceLegend ?? 0, 0, 999)
    };

    const savedAlbum = saved?.album?.[seriesId] ?? {};
    album[seriesId] = Object.keys(savedAlbum).reduce((acc, itemId) => {
      acc[itemId] = Boolean(savedAlbum[itemId]);
      return acc;
    }, {});

    const savedBonus = saved?.setBonus?.[seriesId] ?? {};
    setBonus[seriesId] = {
      unlocked: Boolean(savedBonus.unlocked),
      badgeName: savedBonus.badgeName,
      reward: savedBonus.reward
    };
  });

  const history = Array.isArray(saved?.history) ? saved.history.slice(-200) : [];

  return {
    ...defaults,
    ...saved,
    tickets,
    dust,
    pity,
    album,
    setBonus,
    history
  };
}

function clampNumber(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}
