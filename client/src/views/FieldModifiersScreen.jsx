import { formatRarity } from "../lib/rarity";

function FieldModifiersScreen({ series, collected = {}, spriteMap = {} }) {
  const modifiers = series.items.filter(
    (item) => item.type === "field_modifier"
  );

  return (
    <section className="panel field-panel">
      <header>
        <h1>Field Modifiers</h1>
        <p>
          Activate lures to shift encounter rates for 10 minutes. They never
          spawn impossible Pokémon and they don&apos;t stack with Repels.
        </p>
      </header>

      {modifiers.length === 0 ? (
        <p>No field modifiers in this series.</p>
      ) : (
        <div className="field-grid">
          {modifiers.map((item) => {
            const owned = Boolean(collected[item.id]);
            const spriteSrc = spriteMap[item.id];
            return (
              <div
                key={item.id}
                className={`field-card ${owned ? "owned" : "locked"}`}
              >
                <header>
                  {spriteSrc && (
                    <img
                      className="sprite-thumb"
                      src={spriteSrc}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                  <h3>{item.name}</h3>
                  <span className={`rarity-tag rarity-${item.rarity}`}>
                    {formatRarity(item.rarity)}
                  </span>
                </header>
                <p>
                  Route impact: {item.modifier?.table ?? "Unknown"} · Duration:{" "}
                  {(item.modifier?.durationSec ?? 0) / 60} min
                </p>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
                <p className="status">
                  {owned ? "Unlocked via capsule" : "Find in capsules or craft"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default FieldModifiersScreen;
