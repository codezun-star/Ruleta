import type {WheelFonts, WheelPalette} from './wheelPalette';

/** Espacio de diseño fijo; el dibujo se escala al tamaño real del canvas. */
export const DESIGN = {width: 460, height: 470, cx: 230, cy: 240} as const;

const SEGMENT_RADIUS = 150;
const RIM_RADIUS = 160;
const RIM_WIDTH = 20;
const OUTER_RADIUS = 170.5;
const LANTERN_RADIUS = 195;
const LANTERN_COUNT = 12;
const RIVET_COUNT = 24;
const HUB_RADIUS = 34;
/** El rótulo vive entre el cubo y el aro: nunca debe pisar el esmalte rojo. */
const LABEL_RADIUS = 88;
const LABEL_MAX_WIDTH = 96;

type SegmentInk = {fill: keyof WheelPalette; text: keyof WheelPalette};

/**
 * Cuatro tintas planas que nunca dejan dos segmentos iguales seguidos. Las
 * cuatro llevan rótulo en índigo: la más floja (matcha) da 4.1:1, que cumple
 * AA porque el rótulo va a 19px en negrita.
 */
const SEGMENT_INKS: SegmentInk[] = [
  {fill: 'mustard', text: 'ink'},
  {fill: 'paper', text: 'ink'},
  {fill: 'matcha', text: 'ink'},
  {fill: 'sakura', text: 'ink'}
];

export type DrawWheelOptions = {
  labels: string[];
  rotation: number;
  palette: WheelPalette;
  fonts: WheelFonts;
  /** Índice del farol encendido a la cabeza de la secuencia. -1 los apaga. */
  litLantern?: number;
  /** Todos los faroles encendidos a la vez, al terminar el giro. */
  allLanternsLit?: boolean;
  /** Segmento ganador: se mantiene a plena tinta y el resto se atenúa. */
  highlight?: number | null;
  /** Grados que el puntero ha rebotado al golpear el clavo del segmento. */
  pointerAngle?: number;
  /** `true` cuando la fuente del glifo del eje ya está disponible. */
  glyphReady?: boolean;
  glyph?: string;
};

function polar(radius: number, degrees: number): [number, number] {
  const a = ((degrees - 90) * Math.PI) / 180;
  return [DESIGN.cx + radius * Math.cos(a), DESIGN.cy + radius * Math.sin(a)];
}

/**
 * Dibuja la ruleta completa en el espacio de diseño. La función es pura:
 * recibe el ángulo y no guarda estado, para poder llamarla desde un bucle de
 * `requestAnimationFrame` sin volver a renderizar React.
 */
export function drawWheel(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {labels, rotation, palette, fonts, highlight = null} = options;
  const count = labels.length;
  if (count === 0) return;
  const step = 360 / count;
  const {cx, cy} = DESIGN;

  ctx.clearRect(0, 0, DESIGN.width, DESIGN.height);
  ctx.lineJoin = 'round';

  // Sombra dura desplazada: una copia del disco, no un difuminado. Usa su
  // propio color porque en modo noche la tinta es crema y haría de halo.
  ctx.fillStyle = palette.shadow;
  ctx.beginPath();
  ctx.arc(cx + 8, cy + 8, OUTER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  labels.forEach((label, i) => {
    const ink = SEGMENT_INKS[i % SEGMENT_INKS.length] as SegmentInk;
    const start = ((i * step - step / 2 - 90) * Math.PI) / 180;
    const end = start + (step * Math.PI) / 180;

    ctx.globalAlpha = highlight === null || highlight === i ? 1 : 0.28;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, SEGMENT_RADIUS, start, end);
    ctx.closePath();
    ctx.fillStyle = palette[ink.fill];
    ctx.fill();
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rótulo radial, volteado en la mitad izquierda para que nunca caiga boca abajo.
    const mid = i * step;
    const flip = mid > 90 && mid < 270;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((flip ? mid + 180 : mid) * Math.PI) / 180);
    ctx.fillStyle = palette[ink.text];
    ctx.font = fonts.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, flip ? LABEL_RADIUS : -LABEL_RADIUS, LABEL_MAX_WIDTH);
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(cx, cy, SEGMENT_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Aro de esmalte rojo con remaches.
  ctx.beginPath();
  ctx.arc(cx, cy, RIM_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = palette.vermilion;
  ctx.lineWidth = RIM_WIDTH;
  ctx.stroke();

  ctx.fillStyle = palette.onVermilion;
  for (let i = 0; i < RIVET_COUNT; i++) {
    const [x, y] = polar(RIM_RADIUS, (i * 360) / RIVET_COUNT + 180 / RIVET_COUNT);
    ctx.beginPath();
    ctx.arc(x, y, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, OUTER_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  drawLanterns(ctx, options);
  drawHub(ctx, options);
  drawPointer(ctx, options);
}

function drawLanterns(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {palette, litLantern = -1, allLanternsLit = false} = options;
  for (let i = 0; i < LANTERN_COUNT; i++) {
    const [x, y] = polar(LANTERN_RADIUS, (i * 360) / LANTERN_COUNT + 15);
    const distance = litLantern < 0 ? Infinity : (i - litLantern + LANTERN_COUNT) % LANTERN_COUNT;
    const lit = allLanternsLit || distance <= 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(0, -13);
    ctx.stroke();

    ctx.fillStyle = palette.ink;
    ctx.fillRect(-5, -14, 10, 3);
    ctx.fillRect(-3.5, 11, 7, 3);

    ctx.beginPath();
    ctx.ellipse(0, 0, 8.5, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = lit ? palette.lantern : palette.lanternOff;
    ctx.fill();
    ctx.stroke();

    // Varillas del farol.
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(8, -4);
    ctx.moveTo(-8, 4);
    ctx.lineTo(8, 4);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function drawHub(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {palette, fonts, glyph, glyphReady} = options;
  const {cx, cy} = DESIGN;

  ctx.fillStyle = palette.shadow;
  ctx.beginPath();
  ctx.arc(cx + 4, cy + 4, HUB_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, HUB_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = palette.vermilion;
  ctx.fill();
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (glyph && glyphReady) {
    ctx.fillStyle = palette.onVermilion;
    ctx.font = fonts.glyph;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, cx, cy + 1);
  } else {
    // Mientras la fuente no esté, un eje geométrico en vez de un hueco.
    ctx.strokeStyle = palette.onVermilion;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = palette.onVermilion;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPointer(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {palette, pointerAngle = 0} = options;
  const {cx, cy} = DESIGN;
  const pivotY = cy - 198;

  const shape = (offsetX: number, offsetY: number, fill: string, stroke: boolean) => {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy - 194);
    ctx.lineTo(cx + 17, cy - 194);
    ctx.lineTo(cx, cy - 138);
    ctx.closePath();
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, pivotY, 17, 0, Math.PI * 2);
    ctx.fill();
    if (stroke) ctx.stroke();
    ctx.restore();
  };

  ctx.save();
  ctx.translate(cx, pivotY);
  ctx.rotate((pointerAngle * Math.PI) / 180);
  ctx.translate(-cx, -pivotY);
  shape(4, 4, palette.shadow, false);
  shape(0, 0, palette.vermilion, true);
  ctx.restore();
}
