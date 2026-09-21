import type {WheelPalette} from './wheelPalette';

type Shape = 'papel' | 'circulo' | 'rombo';

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  color: string;
  shape: Shape;
  life: number;
};

const PIECE_COUNT = 120;
const GRAVITY = 0.04;
const SHAPES: Shape[] = ['papel', 'papel', 'circulo', 'rombo'];

/**
 * Papel picado cayendo: rectángulos recortados, redondeles y rombos en las
 * tintas de la paleta. Vive en su propio canvas encima de la ruleta.
 */
export class Confetti {
  private pieces: Piece[] = [];
  private frame = 0;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('El canvas de confeti no dio contexto 2D');
    this.ctx = ctx;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  burst(palette: WheelPalette): void {
    this.resize();
    const {width} = this.canvas.getBoundingClientRect();
    const colors = [
      palette.vermilion,
      palette.mustard,
      palette.matcha,
      palette.sakura,
      palette.paper
    ];

    this.pieces = Array.from({length: PIECE_COUNT}, () => ({
      x: width / 2 + (Math.random() - 0.5) * width * 0.7,
      y: -20 - Math.random() * 160,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 1.4 + Math.random() * 2.6,
      size: 5 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.03 + Math.random() * 0.04,
      color: colors[Math.floor(Math.random() * colors.length)] as string,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] as Shape,
      life: 1
    }));

    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pieces = [];
    const {width, height} = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
  }

  private tick = (): void => {
    const {width, height} = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
    let alive = 0;

    for (const piece of this.pieces) {
      piece.vy += GRAVITY;
      piece.sway += piece.swaySpeed;
      piece.x += piece.vx + Math.sin(piece.sway) * 0.9;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      if (piece.y > height * 0.78) piece.life -= 0.03;
      if (piece.life <= 0) continue;
      alive++;
      this.draw(piece);
    }

    this.frame = alive ? requestAnimationFrame(this.tick) : 0;
  };

  private draw(piece: Piece): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = Math.max(0, piece.life);
    ctx.fillStyle = piece.color;

    const s = piece.size;
    if (piece.shape === 'circulo') {
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (piece.shape === 'rombo') {
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s / 2, 0);
      ctx.lineTo(0, s / 2);
      ctx.lineTo(-s / 2, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Papelito con la punta recortada, como el del papel picado.
      ctx.beginPath();
      ctx.moveTo(-s / 2, -s / 3);
      ctx.lineTo(s / 2, -s / 3);
      ctx.lineTo(s / 2, s / 4);
      ctx.lineTo(0, s / 2);
      ctx.lineTo(-s / 2, s / 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
