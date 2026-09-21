export type WheelPalette = {
  ink: string;
  paper: string;
  vermilion: string;
  mustard: string;
  matcha: string;
  sakura: string;
  onVermilion: string;
  lantern: string;
  lanternOff: string;
  shadow: string;
};

const TOKENS: Record<keyof WheelPalette, string> = {
  ink: '--ink',
  paper: '--paper-hi',
  vermilion: '--vermilion',
  mustard: '--mustard',
  matcha: '--matcha',
  sakura: '--sakura',
  onVermilion: '--on-vermilion',
  lantern: '--lantern',
  lanternOff: '--lantern-off',
  shadow: '--shadow-color'
};

const FALLBACK: WheelPalette = {
  ink: '#1b2a41',
  paper: '#fbf3e2',
  vermilion: '#c8382b',
  mustard: '#e0a526',
  matcha: '#7a8f5a',
  sakura: '#e8a9a0',
  onVermilion: '#fff8ec',
  lantern: '#f2c45a',
  lanternOff: '#d9c9a6',
  shadow: '#1b2a41'
};

/**
 * El canvas no entiende `var(--vermilion)`, así que resolvemos las tintas
 * contra el tema activo. Se vuelve a leer cuando cambia `data-theme`.
 */
export function readWheelPalette(): WheelPalette {
  if (typeof window === 'undefined') return FALLBACK;
  const styles = getComputedStyle(document.documentElement);
  const entries = Object.entries(TOKENS).map(([key, token]) => {
    const value = styles.getPropertyValue(token).trim();
    return [key, value || FALLBACK[key as keyof WheelPalette]];
  });
  return Object.fromEntries(entries) as WheelPalette;
}

export type WheelFonts = {
  /** Rótulo de cada segmento. */
  label: string;
  /** Glifo del eje. */
  glyph: string;
};

const FALLBACK_STACK = "Georgia, 'Times New Roman', serif";

/**
 * `ctx.font` no resuelve `var(--font-fraunces)`: si la cadena no es válida el
 * canvas ignora la asignación en silencio y sigue con la fuente anterior. Por
 * eso resolvemos aquí el nombre real que genera `next/font`.
 */
export function readWheelFonts(): WheelFonts {
  const glyph = `30px 'Shippori Mincho B1', ${FALLBACK_STACK}`;
  if (typeof window === 'undefined') {
    return {label: `700 19px ${FALLBACK_STACK}`, glyph};
  }
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-fraunces').trim();
  return {
    label: `700 19px ${family ? `${family}, ` : ''}${FALLBACK_STACK}`,
    glyph
  };
}
