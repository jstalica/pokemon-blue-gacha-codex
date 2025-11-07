let audioContext;

function getContext() {
  if (typeof window === "undefined") return undefined;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn("AudioContext unavailable", error);
    }
  }
  return audioContext;
}

function playTone({ frequencyStart, frequencyEnd, duration = 0.2, type = "sine" }) {
  const context = getContext();
  if (!context) return;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequencyStart, context.currentTime);
  osc.frequency.linearRampToValueAtTime(frequencyEnd, context.currentTime + duration);

  gain.gain.setValueAtTime(0.22, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  osc.connect(gain);
  gain.connect(context.destination);

  osc.start();
  osc.stop(context.currentTime + duration + 0.02);
}

export function playRevealSfx(step) {
  switch (step) {
    case "intro":
      playTone({ frequencyStart: 180, frequencyEnd: 220, duration: 0.18, type: "sine" });
      break;
    case "drop":
      playTone({ frequencyStart: 220, frequencyEnd: 160, duration: 0.22, type: "triangle" });
      break;
    case "crack":
      playTone({ frequencyStart: 500, frequencyEnd: 320, duration: 0.3, type: "square" });
      break;
    case "result":
      playTone({ frequencyStart: 660, frequencyEnd: 880, duration: 0.25, type: "sine" });
      break;
    default:
      break;
  }
}

export function playUiClick() {
  playTone({ frequencyStart: 520, frequencyEnd: 380, duration: 0.08, type: "square" });
}
