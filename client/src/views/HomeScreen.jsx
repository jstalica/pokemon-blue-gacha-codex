import { formatRarity } from "../lib/rarity";

function HomeScreen({
  series,
  tickets,
  dust,
  completionPercent,
  collectedCount,
  totalItems,
  onStart,
  onReset,
  craftTargets = []
}) {
  return (
    <section className="panel home-panel">
      <div className="home-card">
        <h1>Kanto Capsule Machines</h1>
        <p className="lead">
          Trade your Tickets for capsule rewards that reshape how the world
          feels—cosmetics, chiptune swaps, and field modifiers without combat
          buffs.
        </p>

        <div className="stats-grid">
          <div>
            <h2>Tickets</h2>
            <p>{tickets}</p>
          </div>
          <div>
            <h2>Dust</h2>
            <p>{dust}</p>
          </div>
          <div>
            <h2>Album</h2>
            <p>
              {collectedCount}/{totalItems} ({completionPercent}%)
            </p>
          </div>
        </div>

        <button className="primary" onClick={onStart}>
          Enter {series.name} Kiosk
        </button>
      </div>

      <aside className="home-side">
        <h3>Craft Targets</h3>
        {craftTargets.length === 0 ? (
          <p>Album complete! Legendary memories unlocked.</p>
        ) : (
          <ul>
            {craftTargets.map((target) => (
              <li key={target.id}>
                {target.sprite && (
                  <img src={target.sprite} alt="" aria-hidden="true" />
                )}
                <span>{target.name}</span>
                <span className={`rarity-tag rarity-${target.rarity}`}>
                  {formatRarity(target.rarity)}
                </span>
                <span className="dust-cost">
                  {target.dustCost} Dust{target.canCraft ? " • ready" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button className="ghost" onClick={onReset}>
          Reset Save Data
        </button>
      </aside>
    </section>
  );
}

export default HomeScreen;
