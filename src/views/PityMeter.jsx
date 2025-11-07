function PityMeter({ pity }) {
  const softProgress = Math.min(1, (pity.pullsSinceEpic ?? 0) / 19);
  const hardProgress = Math.min(1, (pity.pullsSinceLegend ?? 0) / 49);
  const softRemaining = Math.max(0, 20 - (pity.pullsSinceEpic ?? 0) - 1);
  const hardRemaining = Math.max(0, 50 - (pity.pullsSinceLegend ?? 0) - 1);

  return (
    <div className="pity-meter" aria-label="Pity progress">
      <header className="pity-header">
        <h4>Pity Meter</h4>
        <span>Shows pulls until guaranteed upgrades</span>
      </header>
      <div className="pity-track">
        <span className="pity-label">Epic</span>
        <div className="pity-bar" role="progressbar" aria-valuemin={0} aria-valuemax={19} aria-valuenow={pity.pullsSinceEpic ?? 0}>
          <div className="pity-fill soft" style={{ width: `${softProgress * 100}%` }} />
        </div>
        <span className="pity-remaining">{softRemaining === 0 ? "Next" : `${softRemaining} pulls`}</span>
      </div>

      <div className="pity-track">
        <span className="pity-label">Legendary</span>
        <div className="pity-bar" role="progressbar" aria-valuemin={0} aria-valuemax={49} aria-valuenow={pity.pullsSinceLegend ?? 0}>
          <div className="pity-fill hard" style={{ width: `${hardProgress * 100}%` }} />
        </div>
        <span className="pity-remaining">{hardRemaining === 0 ? "Next" : `${hardRemaining} pulls`}</span>
      </div>
    </div>
  );
}

export default PityMeter;
