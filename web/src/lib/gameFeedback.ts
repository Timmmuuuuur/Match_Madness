/** Pleasant game feedback — soft chime, haptics, encouragement copy. */

const ENCOURAGEMENT = [
  'Good job!',
  'Nice one!',
  'Keep going!',
  'You\'ve got this!',
  'Well done!',
  'Crushing it!',
  'On fire!',
  'Solid match!',
  'Great work!',
  'Nailed it!',
];

const STREAK_MSGS = [
  'Streak building!',
  'Unstoppable!',
  'Look at that streak!',
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Short, soft ascending chime — not annoying. */
export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.07);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

/** Gentle low tone on wrong match — optional, very quiet. */
export function playWrongSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, t);
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** Buzz every 5 correct matches on supported phones. */
export function maybeCelebrateHaptic(correctCount: number): void {
  if (correctCount > 0 && correctCount % 5 === 0 && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([20, 30, 20]);
  }
}

export function pickEncouragement(streak: number, correctCount: number): string | null {
  if (correctCount > 0 && correctCount % 5 === 0) {
    return ENCOURAGEMENT[correctCount % ENCOURAGEMENT.length];
  }
  if (streak >= 4 && streak % 3 === 0) {
    return STREAK_MSGS[streak % STREAK_MSGS.length];
  }
  if (streak === 3) return 'Three in a row!';
  return null;
}

/** Resume audio after first user tap (browser autoplay policy). */
export function primeGameAudio(): void {
  void getAudioContext()?.resume();
}
