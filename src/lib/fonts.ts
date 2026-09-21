import {Bevan, DM_Sans, Fraunces} from 'next/font/google';

/** Titulares: serif retro de contraste suave y eje óptico variable. */
export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif']
});

/** Voz de cartel: slab pesada de imprenta de feria. Para botones y rótulos. */
export const bevan = Bevan({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bevan',
  display: 'swap',
  fallback: ['Georgia', 'serif']
});

/** Interfaz y párrafos: sans limpia y cálida, buena para el español. */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif']
});

export const fontVariables = `${fraunces.variable} ${bevan.variable} ${dmSans.variable}`;
