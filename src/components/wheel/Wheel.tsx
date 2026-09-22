'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BULB_COUNT, DESIGN, drawWheel} from './drawWheel';
import {readWheelLabelFont, readWheelPalette, type WheelPalette} from './wheelPalette';
import {
  createPointerSpring,
  planSpin,
  spinAngleAt,
  SPIN_DURATION_MS,
  type SpinPlan
} from './spinPhysics';
import {Confetti} from './confetti';
import {playChime, playClack, playDrum, unlockAudio} from './sounds';
import {WinnerSeal} from './WinnerSeal';
import {StampButton} from '@/components/ui/StampButton';
import {useSoundEnabled} from '@/lib/soundPreference';
import {randomInt} from '@/lib/draw/random';
import {prefersReducedMotion} from '@/lib/prefersReducedMotion';

/** Vueltas por minuto de la ruleta en reposo. */
const AMBIENT_RPM = 1.4;
/** Milisegundos que tarda la luz en saltar a la bombilla siguiente. */
const CHASE_MS = 110;
/** Espera entre el golpe de parada y la campanilla del resultado. */
const CHIME_DELAY_MS = 260;

type Status = 'idle' | 'spinning' | 'done';

export function Wheel({
  labels,
  ambient = true,
  disabled = false,
  /**
   * Quién decide el ganador. En la demo lo sortea el cliente; a partir de la
   * Fase 5 lo devuelve el servidor y la animación se limita a llevar el
   * puntero hasta ahí.
   */
  resolveWinner,
  onResult,
  copy
}: {
  /** Referencia estable: al cambiar se reconstruye el bucle de la ruleta. */
  labels: string[];
  ambient?: boolean;
  disabled?: boolean;
  resolveWinner?: () => Promise<number> | number;
  onResult?: (index: number) => void;
  /** Para ceremonias donde nadie "gana": el amigo secreto solo pasa turno. */
  copy?: {spin?: string; again?: string; caption?: string; seal?: string};
}) {
  const t = useTranslations('wheel');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<{spin: (winner: number) => void} | null>(null);
  const finishRef = useRef<(winner: number) => void>(() => {});
  const confettiEngineRef = useRef<Confetti | null>(null);
  const paletteRef = useRef<WheelPalette | null>(null);

  const soundEnabled = useSoundEnabled();
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const [status, setStatus] = useState<Status>('idle');
  const [winner, setWinner] = useState<number | null>(null);

  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  finishRef.current = (index: number) => {
    setWinner(index);
    setStatus('done');
    if (!prefersReducedMotion() && paletteRef.current) {
      confettiEngineRef.current?.burst(paletteRef.current);
    }
    resultRef.current?.(index);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const confettiCanvas = confettiRef.current;
    if (!canvas || !confettiCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const confetti = new Confetti(confettiCanvas);
    confettiEngineRef.current = confetti;

    const segmentStep = 360 / labels.length;
    const spring = createPointerSpring();

    let palette = readWheelPalette();
    let labelFont = readWheelLabelFont();
    paletteRef.current = palette;

    let mode: 'ambient' | 'spin' | 'rest' = ambient && !prefersReducedMotion() ? 'ambient' : 'rest';
    let rotation = 0;
    let plan: SpinPlan | null = null;
    let spinStartedAt = 0;
    let pendingWinner = 0;
    let lastAngle = 0;
    let lastSegment = 0;
    let bulb = 0;
    let pointer = 0;
    let highlight: number | null = null;
    let frame = 0;
    let last = performance.now();
    let disposed = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(rect.width / DESIGN.width, rect.height / DESIGN.height);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.scale(scale, scale);
      ctx.translate(
        (rect.width / scale - DESIGN.width) / 2,
        (rect.height / scale - DESIGN.height) / 2
      );
      confetti.resize();
    };

    const paint = () => {
      drawWheel(ctx, {
        labels,
        rotation,
        palette,
        labelFont,
        litBulb: mode === 'rest' ? -1 : bulb,
        allBulbsLit: mode === 'rest',
        highlight,
        pointerAngle: pointer
      });
    };

    const stopLoop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const startLoop = () => {
      if (frame || disposed) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    function tick(now: number) {
      const delta = now - last;
      last = now;

      if (mode === 'ambient') {
        rotation = (rotation + (AMBIENT_RPM * 360 * delta) / 60000) % 360;
        bulb = Math.floor(now / CHASE_MS) % BULB_COUNT;
      } else if (mode === 'spin' && plan) {
        const progress = Math.min(1, (now - spinStartedAt) / SPIN_DURATION_MS);
        rotation = spinAngleAt(progress, plan);

        const speed = Math.abs(rotation - lastAngle);
        lastAngle = rotation;

        // Un clavo por segmento: el clac, el rebote y la luz van al mismo ritmo.
        const segment = Math.floor(rotation / segmentStep);
        if (segment !== lastSegment) {
          lastSegment = segment;
          spring.kick(speed);
          bulb = (bulb + 1) % BULB_COUNT;
          if (soundRef.current) playClack(Math.min(1, speed / 14));
        }

        if (progress >= 1) {
          rotation = ((plan.to % 360) + 360) % 360;
          highlight = pendingWinner;
          mode = 'rest';
          spring.reset();
          pointer = 0;
          if (soundRef.current) {
            playDrum();
            window.setTimeout(() => {
              if (!disposed && soundRef.current) playChime();
            }, CHIME_DELAY_MS);
          }
          finishRef.current(pendingWinner);
        }
      }

      pointer = mode === 'spin' ? spring.step() : 0;
      paint();

      if (mode === 'rest') {
        stopLoop();
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    controllerRef.current = {
      spin(nextWinner: number) {
        pendingWinner = nextWinner;
        highlight = null;
        confetti.stop();
        plan = planSpin(rotation, nextWinner, labels.length);
        lastAngle = rotation;
        lastSegment = Math.floor(rotation / segmentStep);

        if (prefersReducedMotion()) {
          rotation = ((plan.to % 360) + 360) % 360;
          highlight = nextWinner;
          mode = 'rest';
          paint();
          finishRef.current(nextWinner);
          return;
        }

        spinStartedAt = performance.now();
        mode = 'spin';
        startLoop();
      }
    };

    resize();
    paint();
    if (mode === 'ambient') startLoop();

    // El canvas mide el rótulo al dibujar: hay que repintar cuando llega la fuente.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      labelFont = readWheelLabelFont();
      paint();
    });

    const sizeWatcher = new ResizeObserver(() => {
      resize();
      paint();
    });
    sizeWatcher.observe(canvas);

    // El canvas no cascadea: al cambiar de tema hay que releer las tintas.
    const themeWatcher = new MutationObserver(() => {
      palette = readWheelPalette();
      paletteRef.current = palette;
      paint();
    });
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      disposed = true;
      stopLoop();
      confetti.stop();
      sizeWatcher.disconnect();
      themeWatcher.disconnect();
      controllerRef.current = null;
      confettiEngineRef.current = null;
    };
  }, [labels, ambient]);

  const spin = useCallback(async () => {
    if (status === 'spinning') return;
    // Los navegadores solo desbloquean el audio dentro de un gesto del usuario.
    if (soundRef.current) unlockAudio();
    setStatus('spinning');
    setWinner(null);
    const index = resolveWinner ? await resolveWinner() : randomInt(labels.length);
    controllerRef.current?.spin(index);
  }, [labels.length, resolveWinner, status]);

  const winnerName = winner === null ? null : labels[winner];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative mx-auto w-full max-w-[460px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t('canvas')}
          className="block h-auto w-full"
          style={{aspectRatio: `${DESIGN.width} / ${DESIGN.height}`}}
        />
        <canvas
          ref={confettiRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>

      <StampButton onClick={spin} disabled={disabled || status === 'spinning'}>
        {status === 'spinning'
          ? t('spinning')
          : status === 'done'
            ? (copy?.again ?? t('again'))
            : (copy?.spin ?? t('spin'))}
      </StampButton>

      <div aria-live="polite" className="min-h-24 pt-3 text-center">
        {status === 'done' && winnerName ? (
          <WinnerSeal
            name={winnerName}
            caption={copy?.caption ?? t('caption')}
            sealWord={copy?.seal ?? t('seal')}
          />
        ) : null}
      </div>
    </div>
  );
}
