import { useEffect } from "react";
import { playRevealSfx } from "../lib/sfx";
import { formatRarity } from "../lib/rarity";

const REVEAL_STEPS = ["intro", "drop", "crack", "result"];
const STEP_TIMEOUT_MS = {
  intro: 400,
  drop: 500,
  crack: 600
};

function RevealScreen({
  reveal,
  revealStep,
  series,
  onAdvanceReveal,
  onPullAgain,
  onViewAlbum,
  onBackToKiosk,
  onUiSound
}) {
  if (!reveal) return null;

  const { item, rarity, duplicate, dustAwarded, spriteSrc } = reveal;

  useEffect(() => {
    if (!revealStep || revealStep === "result") return undefined;

    const currentIndex = REVEAL_STEPS.indexOf(revealStep);
    if (currentIndex === -1 || currentIndex === REVEAL_STEPS.length - 1) {
      onAdvanceReveal("result");
      return undefined;
    }

    playRevealSfx(revealStep);

    const timeout = setTimeout(() => {
      onAdvanceReveal(REVEAL_STEPS[currentIndex + 1]);
    }, STEP_TIMEOUT_MS[revealStep] ?? 500);

    return () => clearTimeout(timeout);
  }, [revealStep, onAdvanceReveal]);

  const activeStep = REVEAL_STEPS.includes(revealStep)
    ? revealStep
    : "result";
  const isResult = activeStep === "result";

  useEffect(() => {
    if (activeStep === "result") {
      playRevealSfx("result");
    }
  }, [activeStep]);

  return (
    <section className="panel reveal-panel">
      <article className={`reveal-card rarity-${rarity}`}>
        <header>
          <h1>Capsule Result</h1>
          <p>{series.name}</p>
        </header>

        <div className={`capsule-sequence step-${activeStep}`}>
          <div className="capsule-stage">
            <div className="capsule intact" />
            <div className="capsule split-left" />
            <div className="capsule split-right" />
            <div className="capsule-glow" />
          </div>
        </div>

        <div className={`reward-card ${isResult ? "show" : "hidden"}`}>
          {spriteSrc && (
            <div className="reward-sprite">
              <img src={spriteSrc} alt={item.name} />
            </div>
          )}
          <span className={`rarity-tag rarity-${rarity}`}>{formatRarity(rarity)}</span>
          <h2>{item.name}</h2>
          <p className="type-tag">{formatType(item.type)}</p>
          {item.description && <p className="item-description">{item.description}</p>}
          {item.type === "field_modifier" && item.modifier && (
            <p className="modifier-detail">
              Boosts {item.modifier.table} encounters for {item.modifier.durationSec / 60} minutes.
            </p>
          )}
        </div>

        <div className="reveal-footer">
          {duplicate ? (
            <p className="duplicate">
              Duplicate! Converted into {dustAwarded} Dust.
            </p>
          ) : (
            <p className="new">
              New entry added to your album!
            </p>
          )}
        </div>

        <div className="reveal-actions">
          <button
            className="ghost skip-button"
            onClick={() => {
              onUiSound?.();
              onAdvanceReveal("result");
            }}
            disabled={isResult}
          >
            {isResult ? "Revealed" : "Skip Animation"}
          </button>
          <button
            className="primary"
            onClick={onPullAgain}
            disabled={!isResult}
          >
            Pull Again
          </button>
          <button className="ghost" onClick={onBackToKiosk}>
            Back to Kiosk
          </button>
          <button className="ghost" onClick={onViewAlbum}>
            View Album
          </button>
        </div>
      </article>
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

export default RevealScreen;
