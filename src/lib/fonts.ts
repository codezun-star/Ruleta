import {Fraunces, Shippori_Mincho_B1, Zen_Kaku_Gothic_New} from 'next/font/google';

/** Titulares latinos: serif retro de contraste suave, eje óptico variable. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

/** Display: mincho con remates marcados, sabor a imprenta de los 70. */
export const shippori = Shippori_Mincho_B1({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-shippori',
  display: 'swap',
  fallback: ['Georgia', 'serif']
});

/** Interfaz y párrafos: sans humanista con métricas compartidas ES/EN/JA. */
export const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif']
});

export const fontVariables = `${fraunces.variable} ${shippori.variable} ${zenKaku.variable}`;
