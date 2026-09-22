/**
 * Sonidos sintetizados con WebAudio: ni un archivo que descargar. Todos son
 * cortos y secos, como los de una tómbola de madera.
 *
 * Las funciones `schedule*` trabajan sobre cualquier `BaseAudioContext`, para
 * poder renderizarlas en un `OfflineAudioContext` y **medir** el nivel de
 * salida en lugar de suponerlo.
 */

/** Dos clacs más seguidos que esto se solapan y suenan a zumbido. */
const MIN_CLACK_GAP_MS = 26;

let context: AudioContext | null = null;
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();
const masterCache = new WeakMap<BaseAudioContext, AudioNode>();
let lastClackAt = 0;

/**
 * Todo pasa por un compresor antes de salir. Durante la frenada hay clacs
 * solapados con el golpe final, y sin esto los picos se recortan y suena a
 * chasquido digital.
 */
function master(ctx: BaseAudioContext): AudioNode {
  const cached = masterCache.get(ctx);
  if (cached) return cached;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 6;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.12;

  const output = ctx.createGain();
  output.gain.value = 0.9;
  compressor.connect(output).connect(ctx.destination);

  masterCache.set(ctx, compressor);
  return compressor;
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  // Los navegadores arrancan el contexto suspendido hasta que hay un gesto.
  if (context.state === 'suspended') void context.resume();
  return context;
}

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const cached = noiseCache.get(ctx);
  if (cached) return cached;

  const length = Math.floor(ctx.sampleRate * 0.12);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseCache.set(ctx, buffer);
  return buffer;
}

/**
 * Clac de madera: un golpe de ruido filtrado más un tono resonante que decae
 * deprisa. Solo con el ruido filtrado el golpe queda casi inaudible, porque
 * un paso banda estrecho se lleva por delante casi toda la energía.
 */
export function scheduleClack(ctx: BaseAudioContext, at: number, intensity: number): void {
  const strength = Math.min(1, Math.max(0.25, intensity));

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1700 + strength * 900;
  filter.Q.value = 2.2;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.9 * strength, at);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);

  source.connect(filter).connect(noiseGain).connect(master(ctx));
  source.start(at);
  source.stop(at + 0.07);

  const tone = ctx.createOscillator();
  tone.type = 'triangle';
  tone.frequency.setValueAtTime(1250 + strength * 350, at);
  tone.frequency.exponentialRampToValueAtTime(700, at + 0.04);

  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.5 * strength, at);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);

  tone.connect(toneGain).connect(master(ctx));
  tone.start(at);
  tone.stop(at + 0.06);
}

/** Golpe grave al detenerse la ruleta, con un chasquido encima para que se
 *  oiga también en altavoces pequeños, que no dan graves. */
export function scheduleDrum(ctx: BaseAudioContext, at: number): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(210, at);
  osc.frequency.exponentialRampToValueAtTime(52, at + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.62, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);

  osc.connect(gain).connect(master(ctx));
  osc.start(at);
  osc.stop(at + 0.5);

  const slap = ctx.createBufferSource();
  slap.buffer = noiseBuffer(ctx);
  const slapFilter = ctx.createBiquadFilter();
  slapFilter.type = 'lowpass';
  slapFilter.frequency.value = 2600;
  const slapGain = ctx.createGain();
  slapGain.gain.setValueAtTime(0.3, at);
  slapGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
  slap.connect(slapFilter).connect(slapGain).connect(master(ctx));
  slap.start(at);
  slap.stop(at + 0.1);
}

/** Campanilla al revelar el ganador: fundamental, quinta y octava. */
export function scheduleChime(ctx: BaseAudioContext, at: number): void {
  for (const [frequency, delay, level] of [
    [1046.5, 0, 0.5],
    [1568.0, 0.06, 0.34],
    [2093.0, 0.12, 0.2]
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at + delay);
    gain.gain.exponentialRampToValueAtTime(level, at + delay + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + delay + 0.9);

    osc.connect(gain).connect(master(ctx));
    osc.start(at + delay);
    osc.stop(at + delay + 1);
  }
}

/** Hay que llamarlo dentro de un gesto del usuario para desbloquear el audio. */
export function unlockAudio(): void {
  ensureContext();
}

export function playClack(intensity: number): void {
  const ctx = ensureContext();
  if (!ctx) return;
  const now = performance.now();
  if (now - lastClackAt < MIN_CLACK_GAP_MS) return;
  lastClackAt = now;
  scheduleClack(ctx, ctx.currentTime, intensity);
}

export function playDrum(): void {
  const ctx = ensureContext();
  if (ctx) scheduleDrum(ctx, ctx.currentTime);
}

export function playChime(): void {
  const ctx = ensureContext();
  if (ctx) scheduleChime(ctx, ctx.currentTime);
}
