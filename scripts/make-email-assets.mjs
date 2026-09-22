/**
 * Genera los PNG que usan los correos. Outlook no renderiza SVG, así que el
 * sello y la tira de papel picado tienen que viajar como imagen.
 *
 * Sin dependencias: codificador PNG mínimo sobre `zlib`, que ya trae Node.
 */
import {deflateSync} from 'node:zlib';
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'email');

const CRC_TABLE = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/** Supermuestreo: la cobertura de cada píxel da el antialiasing. */
function render(width, height, samples, colorAt) {
  const rgba = Buffer.alloc(width * height * 4);
  const step = 1 / samples;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const color = colorAt(x + (sx + 0.5) * step, y + (sy + 0.5) * step);
          if (!color) continue;
          r += color[0];
          g += color[1];
          b += color[2];
          a += 1;
        }
      }
      const total = samples * samples;
      const index = (y * width + x) * 4;
      if (a > 0) {
        rgba[index] = Math.round(r / a);
        rgba[index + 1] = Math.round(g / a);
        rgba[index + 2] = Math.round(b / a);
        rgba[index + 3] = Math.round((a / total) * 255);
      }
    }
  }
  return encodePng(width, height, rgba);
}

const VERMILION = [200, 56, 43];
const CREAM = [255, 248, 236];
const INK = [27, 42, 65];
const MUSTARD = [224, 165, 38];
const MATCHA = [122, 143, 90];
const SAKURA = [232, 169, 160];
const WOOD = [200, 160, 106];

/** Sello: disco bermellón con aro, remaches y buje crema. */
function seal(size) {
  const scale = size / 120;
  const rivets = Array.from({length: 8}, (_, k) => {
    const angle = (k * Math.PI) / 4 + Math.PI / 8;
    return [45 * Math.cos(angle), 45 * Math.sin(angle)];
  });

  return render(size, size, 4, (px, py) => {
    const x = px / scale - 60;
    const y = py / scale - 60;
    const d = Math.hypot(x, y);
    if (d > 52) return null;
    if (d <= 13) return CREAM;
    if (Math.abs(d - 34) <= 1.8) return CREAM;
    for (const [rx, ry] of rivets) {
      if (Math.hypot(x - rx, y - ry) <= 3.4) return CREAM;
    }
    return VERMILION;
  });
}

/** Tira de papel picado, para la cabecera del correo. */
function papelPicado(width, height) {
  const colors = [VERMILION, MUSTARD, MATCHA, SAKURA, WOOD];
  const flagWidth = 56;
  const scale = height / 46;

  return render(width, height, 4, (px, py) => {
    const x = px / scale;
    const y = py / scale;
    if (y <= 3) return INK;

    const index = Math.floor(x / flagWidth);
    const local = x - index * flagWidth;
    if (local < 4 || local > 52) return null;

    const center = 28;
    // Cuerpo recto hasta y=30 y luego punta hasta y=42.
    if (y > 30) {
      const taper = 1 - (y - 30) / 12;
      if (Math.abs(local - center) > 24 * taper) return null;
    }
    if (y > 42) return null;

    if (Math.hypot(local - center, y - 14) <= 6) return null;
    for (const holeX of [center - 14, center + 14]) {
      if (Math.abs(local - holeX) + Math.abs(y - 24) <= 4) return null;
    }

    return colors[index % colors.length];
  });
}

mkdirSync(OUT_DIR, {recursive: true});
writeFileSync(resolve(OUT_DIR, 'sello.png'), seal(220));
writeFileSync(resolve(OUT_DIR, 'papel-picado.png'), papelPicado(1200, 92));
console.log('Escritos public/email/sello.png y public/email/papel-picado.png');
