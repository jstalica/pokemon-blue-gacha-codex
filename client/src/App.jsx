import { useEffect, useMemo, useState } from "react";
import {
  MAX_TICKETS,
  SERIES_DATA,
  craftCostFor,
  craftItem,
  dustFor,
  performPull,
  resetProgress
} from "./lib/gacha";
import {
  clearGameState,
  loadGameState,
  saveGameState
} from "./state/storage";
import HomeScreen from "./views/HomeScreen.jsx";
import KioskScreen from "./views/KioskScreen.jsx";
import RevealScreen from "./views/RevealScreen.jsx";
import AlbumScreen from "./views/AlbumScreen.jsx";
import FieldModifiersScreen from "./views/FieldModifiersScreen.jsx";
import OddsSheet from "./views/OddsSheet.jsx";
import DebugPanel from "./views/DebugPanel.jsx";
import { playUiClick } from "./lib/sfx";
import { getSpritePath } from "./lib/assets";
import "./index.css";

const DEFAULT_VIEW = "home";
const SERIES_IDS = Object.keys(SERIES_DATA);

function App() {
  const [gameState, setGameState] = useState(() => loadGameState());
  const [activeSeries, setActiveSeries] = useState(SERIES_IDS[0] ?? "S1");
  const [view, setView] = useState(DEFAULT_VIEW);
  const [reveal, setReveal] = useState(null);
  const [revealStep, setRevealStep] = useState("intro");
  const [oddsOpen, setOddsOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const playClick = () => playUiClick();

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const series = SERIES_DATA[activeSeries];
  const album = gameState.album?.[activeSeries] ?? {};
  const pity = gameState.pity?.[activeSeries] ?? {
    pullsSinceEpic: 0,
    pullsSinceLegend: 0
  };

  const spriteMap = useMemo(() => {
    const map = {};
    series.items.forEach((item) => {
      map[item.id] = getSpritePath(item.sprite);
    });
    return map;
  }, [series]);
  const setBonusSprite = useMemo(() => getSpritePath(series.setBonus?.sprite), [series]);

  const collectedCount = useMemo(
    () => Object.keys(album).filter((key) => album[key]).length,
    [album]
  );

  const totalItems = series.items.length;
  const completionPercent =
    totalItems > 0 ? Math.round((collectedCount / totalItems) * 100) : 0;

  const handleNavigate = (nextView) => {
    playClick();
    setView(nextView);
    if (nextView !== "reveal") {
      setReveal(null);
    }
  };

  const handlePull = () => {
    playClick();
    try {
      const { state: nextState, result } = performPull(gameState, activeSeries);
      setGameState(nextState);
      setReveal({
        ...result,
        seriesId: activeSeries,
        timestamp: Date.now(),
        spriteSrc: spriteMap[result.item.id]
      });
      setRevealStep("intro");
      setView("reveal");
      setError("");
      setNotice("");
    } catch (err) {
      setError(err.message || "Unable to complete pull.");
    }
  };

  const handleReset = () => {
    playClick();
    const fresh = resetProgress(gameState, SERIES_IDS);
    setGameState(fresh);
    clearGameState();
    setReveal(null);
    setRevealStep("intro");
    setError("");
    setNotice("");
    setView(DEFAULT_VIEW);
  };

  const handleAddTickets = (amount) => {
    playClick();
    setGameState((prev) => ({
      ...prev,
      tickets: Math.max(0, (prev.tickets ?? 0) + amount)
    }));
    setNotice(`Added ${amount > 0 ? amount : Math.abs(amount)} ticket(s).`);
    setError("");
  };

  const handleSetTickets = (value) => {
    playClick();
    setGameState((prev) => ({
      ...prev,
      tickets: Math.max(0, value)
    }));
    setNotice(`Set tickets to ${Math.max(0, value)}.`);
    setError("");
  };

  const handleAddDust = (amount) => {
    playClick();
    setGameState((prev) => ({
      ...prev,
      dust: Math.max(0, (prev.dust ?? 0) + amount)
    }));
    setNotice(`Added ${amount} dust.`);
    setError("");
  };

  const handleSeriesChange = (event) => {
    playClick();
    const nextId = event.target.value;
    setActiveSeries(nextId);
    setNotice("");
    if (view === "reveal") {
      setView("kiosk");
    }
  };

  const handleRevealAdvance = (step) => {
    setRevealStep(step);
  };

  const craftTargets = useMemo(() => {
    const missing = series.items.filter((item) => !album[item.id]);
    return missing.map((item) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      dustCost: craftCostFor(item.rarity),
      canCraft: gameState.dust >= craftCostFor(item.rarity),
      sprite: spriteMap[item.id],
      description: item.description
    }));
  }, [series, album, gameState.dust, spriteMap]);

  const handleCraftItem = (itemId) => {
    playClick();
    try {
      const { state: nextState, result } = craftItem(
        gameState,
        activeSeries,
        itemId
      );
      if (result?.crafted) {
        setGameState(nextState);
        setNotice(`Crafted ${result.item.name} for ${result.cost} dust.`);
        setError("");
      }
    } catch (err) {
      setError(err.message || "Unable to craft item.");
      setNotice("");
    }
  };

  const sharedProps = {
    series,
    seriesId: activeSeries,
    spriteMap,
    setBonusSprite,
    tickets: gameState.tickets,
    dust: gameState.dust,
    pity,
    setBonus: gameState.setBonus?.[activeSeries],
    onNavigate: handleNavigate,
    onUiSound: playClick
  };

  return (
    <div className={`app-shell theme-kanto view-${view}`}>
      <div className="device-shell">
        <div className="screen-bezel">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-accent">Pokémon</span> Blue Gacha
        </div>
        <div className="series-select">
          <label htmlFor="series">Series</label>
          <select
            id="series"
            value={activeSeries}
            onChange={handleSeriesChange}
          >
            {SERIES_IDS.map((id) => (
              <option key={id} value={id}>
                {SERIES_DATA[id].name}
              </option>
            ))}
          </select>
        </div>
        <div className="stats">
          <div className="stat-chip">
            <span className="stat-icon stat-ticket" />
            <span>{gameState.tickets} / {MAX_TICKETS}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-icon stat-dust" />
            <span>{gameState.dust}</span>
          </div>
          <button className="odds-button" onClick={() => { playClick(); setOddsOpen(true); }}>
            Odds & Pity
          </button>
        </div>
      </header>

      <nav className="nav-strip">
        <button
          className={view === "home" ? "active" : ""}
          onClick={() => handleNavigate("home")}
        >
          Home
        </button>
        <button
          className={view === "kiosk" ? "active" : ""}
          onClick={() => handleNavigate("kiosk")}
        >
          Kiosk
        </button>
        <button
          className={view === "album" ? "active" : ""}
          onClick={() => handleNavigate("album")}
        >
          Album
        </button>
        <button
          className={view === "field" ? "active" : ""}
          onClick={() => handleNavigate("field")}
        >
          Field Modifiers
        </button>
      </nav>

      {error && <div className="error-banner">{error}</div>}
      {!error && notice && <div className="notice-banner">{notice}</div>}

      <main className="content">
        {view === "home" && (
          <HomeScreen
            {...sharedProps}
            completionPercent={completionPercent}
            collectedCount={collectedCount}
            totalItems={totalItems}
            onStart={() => handleNavigate("kiosk")}
            onReset={handleReset}
            craftTargets={craftTargets.slice(0, 3)}
          />
        )}

        {view === "kiosk" && (
          <KioskScreen
            {...sharedProps}
            onPull={handlePull}
            onShowOdds={() => setOddsOpen(true)}
          />
        )}

        {view === "reveal" && reveal && (
          <RevealScreen
            {...sharedProps}
            reveal={reveal}
            revealStep={revealStep}
            onAdvanceReveal={handleRevealAdvance}
            onPullAgain={handlePull}
            onViewAlbum={() => handleNavigate("album")}
            onBackToKiosk={() => handleNavigate("kiosk")}
          />
        )}

        {view === "album" && (
          <AlbumScreen
            {...sharedProps}
            collected={album}
            craftTargets={craftTargets}
            onCraft={handleCraftItem}
          />
        )}

        {view === "field" && (
          <FieldModifiersScreen
            {...sharedProps}
            collected={album}
          />
        )}
      </main>

      <footer className="footer">
        <span>Tickets refill over time. Duplicates convert to dust for crafting.</span>
        <div className="footer-buttons">
        <button className="debug-button" onClick={handleReset}>
          Reset Save
        </button>
        <button
          className="debug-button"
          onClick={() => {
            playClick();
            setDebugOpen(true);
          }}
        >
          Open Cheats
        </button>
      </div>
      </footer>
        </div>
        <div className="device-buttons">
          <div className="btn">A</div>
          <div className="btn">B</div>
        </div>
        <div className="d-pad" />
        <div className="power-led" />
        <div className="device-logo">GAME BOY</div>
      </div>

      {oddsOpen && (
        <OddsSheet
          series={series}
          pity={pity}
          onClose={() => setOddsOpen(false)}
        />
      )}

      {debugOpen && (
        <DebugPanel
          tickets={gameState.tickets}
          dust={gameState.dust}
          onAddTickets={handleAddTickets}
          onSetTickets={handleSetTickets}
          onAddDust={handleAddDust}
          onReset={handleReset}
          onClose={() => setDebugOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
