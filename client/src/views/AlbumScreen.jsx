import { craftCostFor } from "../lib/gacha";
import { formatRarity } from "../lib/rarity";
function AlbumScreen({ series, collected, dust, craftTargets = [], onCraft, spriteMap = {}, onUiSound, setBonus, setBonusSprite }) {
  const collectedCount = series.items.filter((item) => collected[item.id]).length;
  const complete = collectedCount === series.items.length;

  return (
    <section className="panel album-panel">
      <header className="album-header">
        <h1>{series.name} Album</h1>
      </header>

      <div className="album-stats">
        <span>
          Collected {collectedCount}/{series.items.length}
        </span>
        <span>✨ Dust: {dust}</span>
      </div>

      {setBonus && (
        <div className={`set-bonus-callout ${setBonus.unlocked ? "unlocked" : "locked"}`}>
          {setBonus.sprite && setBonusSprite && (
            <div className="set-bonus-sprite">
              <img src={setBonusSprite} alt="" aria-hidden="true" />
            </div>
          )}
          <div>
            <h2>{setBonus.badgeName || "Series Bonus"}</h2>
            <p>
              {setBonus.unlocked
                ? setBonus.reward || "Unlocked DMG shell tint in kiosk"
                : `Collect every capsule in ${series.name} to unlock ${setBonus.reward || "a DMG shell tint"}.`}
            </p>
          </div>
        </div>
      )}

      <div className="album-grid">
        {series.items.map((item) => {
          const owned = Boolean(collected[item.id]);
          const dustCost = craftCostFor(item.rarity);
          const spriteSrc = spriteMap[item.id];
          const canCraft = !owned && dust >= dustCost;
          return (
            <div
              key={item.id}
              className={`album-slot ${owned ? "owned" : "missing"}`}
            >
              {spriteSrc && (
                <div className={`album-sprite ${owned ? "owned" : "missing"}`}>
                  <img src={spriteSrc} alt="" aria-hidden="true" />
                </div>
              )}
              <span className={`rarity-tag rarity-${item.rarity}`}>
                {formatRarity(item.rarity)}
              </span>
              <h3>{item.name}</h3>
              <p>{formatType(item.type)}</p>
              {item.description && (
                <p className="item-description">{item.description}</p>
              )}
              {!owned && (
                <>
                  <p className="craft-note">Craft for {dustCost} dust</p>
                  <button
                    className="craft-button"
                    onClick={() => {
                      onUiSound?.();
                      onCraft?.(item.id);
                    }}
                    disabled={!canCraft}
                  >
                    {canCraft ? "Craft Now" : "Not enough dust"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <aside className="craft-sidebar">
        <h2>Next Craft Goals</h2>
        {craftTargets.length === 0 ? (
          <p>All items collected for this series.</p>
        ) : (
          <ul>
            {craftTargets.map((target) => (
              <li key={target.id}>
                {target.sprite && (
                  <img src={target.sprite} alt="" aria-hidden="true" />
                )}
                <span>{target.name}</span>
                <span>
                  {target.dustCost} dust{target.canCraft ? " • ready" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
}

function formatType(type) {
  switch (type) {
    case "cosmetic":
      return "Cosmetic";
    case "field_modifier":
      return "Field Modifier";
    default:
      return type;
  }
}

export default AlbumScreen;
