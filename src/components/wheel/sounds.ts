/**
 * Sonidos sintetizados con WebAudio: ni un archivo que descargar. Todos son
 * cortos y secos, como los de una tómbola de madera.
 */

/** Dos clacs más seguidos que esto se solapan y suenan a zumbido. */
const MIN_CLACK_GAP_MS = 26;

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let lastClackAt = 0;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  // Los navegadores arrancan el contexto suspendido hasta que hay un gesto.
  if (context.state === 'suspended') void context.resume();
  return context;
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noise) {
    const length = Math.floor(ctx.sampleRate * 0.12);
    noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** Hay que llamarlo dentro de un gesto del usuario para desbloquear el audio. */
export function unlockAudio(): void {
  ensureContext();
}

/** Clac de madera al pasar el puntero por el clavo de un segmento. */
export function playClack(intensity: number): void {
  const ctx = ensureContext();
  if (!ctx) return;
  const now = performance.now();
  if (now - lastClackAt < MIN_CLACK_GAP_MS) return;
  lastClackAt = now;

  const strength = Math.min(1, Math.max(0.15, intensity));
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1500 + strength * 900;
  filter.Q.value = 6;

  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.16 * strength, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
  source.stop(t + 0.06);
}

/** Golpe grave al detenerse la ruleta. */
export function playDrum(): void {
  const ctx = ensureContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.28);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.32, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.45);
}

/** Campanilla al revelar el ganador: dos parciales y una quinta. */
export function playChime(): void {
  const ctx = ensureContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  for (const [frequency, delay, level] of [
    [1046.5, 0, 0.17],
    [1568.0, 0.06, 0.12],
    [2093.0, 0.12, 0.07]
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t + delay);
    gain.gain.exponentialRampToValueAtTime(level, t + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.9);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t + delay);
    osc.stop(t + delay + 1);
  }
}
