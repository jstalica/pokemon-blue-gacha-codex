const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const {
  setSeriesData,
  getSeries,
  createInitialState,
  performPull
} = require("./gacha");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const poolsDirectory = path.join(__dirname, "..", "pools");
const seriesData = loadSeriesPools(poolsDirectory);
setSeriesData(seriesData);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "pokemon-blue-gacha-server" });
});

app.get("/api/pools", (_req, res) => {
  res.json({ series: Object.values(seriesData) });
});

app.get("/api/pools/:seriesId", (req, res) => {
  try {
    const series = getSeries(req.params.seriesId);
    res.json(series);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post("/api/pull", (req, res) => {
  try {
    const { seriesId = "S1", state, options = {} } = req.body || {};
    const seed = req.query.seed ?? options.seed;
    const rng = seed ? createSeededRng(seed) : undefined;
    const timestamp = options.timestamp ?? Date.now();
    const initialState = state || createInitialState([seriesId]);
    const { state: nextState, result } = performPull(initialState, seriesId, {
      rng,
      timestamp
    });
    res.json({ state: nextState, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pokemon Blue Gacha server listening on port ${PORT}`);
});

function loadSeriesPools(directory) {
  const data = {};
  if (!fs.existsSync(directory)) {
    return data;
  }

  const entries = fs.readdirSync(directory);
  entries
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      const fullPath = path.join(directory, file);
      try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const json = JSON.parse(raw);
        if (!json.seriesId) {
          console.warn(`Pool file ${file} missing seriesId.`);
          return;
        }
        data[json.seriesId] = json;
      } catch (error) {
        console.warn(`Failed to load pool file ${file}:`, error.message);
      }
    });

  return data;
}

function createSeededRng(seedInput) {
  let seed = seedInput;
  if (typeof seed === "string") {
    seed = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }
  if (typeof seed !== "number" || Number.isNaN(seed)) {
    return undefined;
  }

  const MODULUS = 2147483647;
  const MULTIPLIER = 48271;
  let state = Math.abs(Math.floor(seed)) % MODULUS;
  if (state === 0) {
    state = 123456789;
  }

  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return state / MODULUS;
  };
}
