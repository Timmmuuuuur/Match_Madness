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
let audioReady: Promise<AudioContext | null> | null = null;

function createContext(): AudioContext | null {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Must run during a user gesture — call on first tap. */
export async function primeGameAudio(): Promise<void> {
  const ctx = createContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    audioReady = ctx.resume().then(() => ctx).catch(() => null);
    await audioReady;
  } else {
    audioReady = Promise.resolve(ctx);
  }
}

async function ensureAudioReady(): Promise<AudioContext | null> {
  if (audioReady) return audioReady;
  const ctx = createContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  audioReady = Promise.resolve(ctx);
  return ctx;
}

/** Short, soft ascending chime — audible but not annoying. */
export async function playCorrectSound(): Promise<void> {
  const ctx = await ensureAudioReady();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, t);
  osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.09);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.14, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.24);
}

/** Gentle low tone on wrong match. */
export async function playWrongSound(): Promise<void> {
  const ctx = await ensureAudioReady();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(196, t);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.16);
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
