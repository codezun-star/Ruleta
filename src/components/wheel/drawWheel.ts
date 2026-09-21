import type {WheelPalette} from './wheelPalette';

/** Espacio de diseño fijo; el dibujo se escala al tamaño real del canvas. */
export const DESIGN = {width: 460, height: 470, cx: 230, cy: 240} as const;

const SEGMENT_RADIUS = 150;
const RIM_RADIUS = 160;
const RIM_WIDTH = 20;
const OUTER_RADIUS = 170.5;
const BULB_RADIUS = 183;
/** Bombillas de la tira. Se exporta porque el bucle calcula cuál va encendida. */
export const BULB_COUNT = 16;
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
  /** Fuente ya resuelta del rótulo de cada segmento. */
  labelFont: string;
  /** Índice de la bombilla a la cabeza de la secuencia. -1 las apaga. */
  litBulb?: number;
  /** Toda la tira encendida a la vez, al terminar el giro. */
  allBulbsLit?: boolean;
  /** Segmento ganador: se mantiene a plena tinta y el resto se atenúa. */
  highlight?: number | null;
  /** Grados que el puntero ha rebotado al golpear el clavo del segmento. */
  pointerAngle?: number;
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
  const {labels, rotation, palette, labelFont, highlight = null} = options;
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

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, SEGMENT_RADIUS, start, end);
    ctx.closePath();
    ctx.fillStyle = palette[ink.fill];
    ctx.fill();

    // Los segmentos que no ganaron se lavan con un velo de papel. Bajarles la
    // opacidad dejaría ver la sombra del disco y saldrían de color barro.
    if (highlight !== null && highlight !== i) {
      ctx.fillStyle = palette.paper;
      ctx.globalAlpha = 0.68;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rótulo radial, volteado en la mitad izquierda para que nunca caiga boca abajo.
    const mid = i * step;
    const flip = mid > 90 && mid < 270;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((flip ? mid + 180 : mid) * Math.PI) / 180);
    ctx.globalAlpha = highlight !== null && highlight !== i ? 0.4 : 1;
    ctx.fillStyle = palette[ink.text];
    ctx.font = labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, flip ? LABEL_RADIUS : -LABEL_RADIUS, LABEL_MAX_WIDTH);
    ctx.restore();
  });

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

  drawBulbs(ctx, options);
  drawHub(ctx, options);
  drawPointer(ctx, options);
}

/** Tira de luces de feria: un cordel con bombillas que se encienden en secuencia. */
function drawBulbs(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {palette, litBulb = -1, allBulbsLit = false} = options;

  ctx.beginPath();
  ctx.arc(DESIGN.cx, DESIGN.cy, BULB_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i < BULB_COUNT; i++) {
    const angle = (i * 360) / BULB_COUNT;
    const [x, y] = polar(BULB_RADIUS, angle);
    const distance = litBulb < 0 ? Infinity : (i - litBulb + BULB_COUNT) % BULB_COUNT;
    const lit = allBulbsLit || distance <= 2;

    ctx.save();
    ctx.translate(x, y);
    // Tras rotar, el eje -y local apunta hacia afuera: el casquillo va al otro lado.
    ctx.rotate((angle * Math.PI) / 180);

    ctx.fillStyle = palette.ink;
    ctx.fillRect(-4.5, 6, 9, 4.5);

    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = lit ? palette.bulbOn : palette.bulbOff;
    ctx.fill();
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    if (lit) {
      ctx.beginPath();
      ctx.arc(-2.4, -2.4, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = palette.paper;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

/** Eje de la ruleta: un sello rojo con el buje troquelado. */
function drawHub(ctx: CanvasRenderingContext2D, options: DrawWheelOptions): void {
  const {palette} = options;
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

  ctx.strokeStyle = palette.onVermilion;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 19, 0, Math.PI * 2);
  ctx.stroke();

  // Cuatro remaches del buje.
  ctx.fillStyle = palette.onVermilion;
  for (let i = 0; i < 4; i++) {
    const [x, y] = polar(19, i * 90 + 45);
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
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
