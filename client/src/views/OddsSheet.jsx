import { formatRarity } from "../lib/rarity";

function OddsSheet({ series, pity = { pullsSinceEpic: 0, pullsSinceLegend: 0 }, onClose }) {
  const rarityEntries = Object.entries(series.rarities);
  const pullsToSoft = Math.max(0, 20 - (pity.pullsSinceEpic + 1));
  const pullsToHard = Math.max(0, 50 - (pity.pullsSinceLegend + 1));
  const softLabel = pullsToSoft === 0 ? "next pull" : `${pullsToSoft} pulls`;
  const hardLabel = pullsToHard === 0 ? "next pull" : `${pullsToHard} pulls`;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal odds-sheet">
        <header>
          <h2>{series.name} Odds</h2>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <table>
          <thead>
            <tr>
              <th>Rarity</th>
              <th>Rate</th>
              <th>Sample Rewards</th>
            </tr>
          </thead>
          <tbody>
            {rarityEntries.map(([rarity, meta]) => {
              const samples = series.items
                .filter((item) => item.rarity === rarity)
                .slice(0, 2)
                .map((item) => item.name)
                .join(", ");
              return (
                <tr key={rarity}>
                  <td>
                    <span className={`rarity-tag rarity-${rarity}`}>
                      {formatRarity(rarity)}
                    </span>
                  </td>
                  <td>{Math.round(meta.rate * 100)}%</td>
                  <td>{samples || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <section className="pity-explainer">
          <h3>Pity System</h3>
          <ul>
            <li>Soft pity upgrades within {softLabel}.</li>
            <li>Hard pity guarantees a Legendary within {hardLabel}.</li>
            <li>Duplicates convert to dust for targeted crafting.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default OddsSheet;
