import { formatRarity } from "../lib/rarity";
import PityMeter from "./PityMeter.jsx";

function KioskScreen({ series, tickets, pity, onPull, onShowOdds, spriteMap = {}, onUiSound }) {
  const disabled = tickets <= 0;
  const pullsUntilEpic = Math.max(0, 20 - (pity.pullsSinceEpic + 1));
  const pullsUntilLegend = Math.max(0, 50 - (pity.pullsSinceLegend + 1));

  return (
    <section className="panel kiosk-panel">
      <article className="kiosk-card">
        <header>
          <h1>{series.name} Capsule Kiosk</h1>
          <p>
            Insert Ticket → spin capsule → reveal cosmetic or field modifier.
            No power boosts, guaranteed.
          </p>
        </header>

        <div className="capsule-machine">
          <div className="machine-head" />
          <div className="machine-body">
            <span className="light" />
            <span className="slot" />
          </div>
          <div className="machine-base" />
        </div>

        <div className="ticket-status">
          <span>🎟 Tickets:</span>
          <strong>{tickets}</strong>
        </div>

        <button
          className="primary"
          onClick={onPull}
          disabled={disabled}
        >
          {disabled ? "No Tickets Remaining" : "Use 1 Ticket"}
        </button>

        <p className="hint">
          Soft pity guarantees Epic or better within {pullsUntilEpic} pulls ·
          Legendary guaranteed within {pullsUntilLegend} pulls.
        </p>

        <PityMeter pity={pity} />

        <button
          className="ghost"
          onClick={() => {
            onUiSound?.();
            onShowOdds();
          }}
        >
          View full odds
        </button>
      </article>

      <aside className="kiosk-side">
        <h3>Featured Capsules</h3>
        <ul>
          {series.items.slice(0, 5).map((item) => (
            <li key={item.id}>
              {spriteMap[item.id] && (
                <img
                  className="sprite-thumb"
                  src={spriteMap[item.id]}
                  alt=""
                  aria-hidden="true"
                />
              )}
              <span>{item.name}</span>
              <span className={`rarity-tag rarity-${item.rarity}`}>
                {formatRarity(item.rarity)}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

export default KioskScreen;
