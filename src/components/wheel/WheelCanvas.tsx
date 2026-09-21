'use client';

import {useEffect, useRef} from 'react';
import {DESIGN, drawWheel} from './drawWheel';
import {readWheelFonts, readWheelPalette, type WheelFonts, type WheelPalette} from './wheelPalette';
import {prefersReducedMotion} from '@/lib/prefersReducedMotion';
import {BRAND} from '@/config/brand';

/** Vueltas por minuto de la ruleta en reposo de la portada. */
const AMBIENT_RPM = 1.4;

/**
 * Ruleta de portada. Dibuja en canvas fuera del ciclo de render de React: el
 * bucle de animación nunca provoca un re-render, así que se mantiene a 60fps.
 */
export function WheelCanvas({
  labels,
  ambient = true,
  label
}: {
  labels: string[];
  ambient?: boolean;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let palette: WheelPalette = readWheelPalette();
    let fonts: WheelFonts = readWheelFonts();
    let glyphReady = false;
    let rotation = 0;
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
    };

    const paint = () => {
      drawWheel(ctx, {
        labels,
        rotation,
        palette,
        fonts,
        glyph: BRAND.glyph,
        glyphReady,
        allLanternsLit: !ambient
      });
    };

    const render = (now: number) => {
      const delta = now - last;
      last = now;
      rotation = (rotation + (AMBIENT_RPM * 360 * delta) / 60000) % 360;
      paint();
      frame = requestAnimationFrame(render);
    };

    const restart = () => {
      resize();
      paint();
    };

    restart();

    // El glifo del eje solo se dibuja cuando su fuente ya está disponible.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      glyphReady = true;
      fonts = readWheelFonts();
      paint();
    });

    const observer = new ResizeObserver(restart);
    observer.observe(canvas);

    // Al cambiar de tema hay que releer las tintas: el canvas no cascadea.
    const themeWatcher = new MutationObserver(() => {
      palette = readWheelPalette();
      paint();
    });
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    if (ambient && !prefersReducedMotion()) {
      frame = requestAnimationFrame(render);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeWatcher.disconnect();
    };
  }, [labels, ambient]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
      style={{aspectRatio: `${DESIGN.width} / ${DESIGN.height}`}}
    />
  );
}
