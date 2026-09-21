export type WheelPalette = {
  ink: string;
  paper: string;
  vermilion: string;
  mustard: string;
  matcha: string;
  sakura: string;
  onVermilion: string;
  bulbOn: string;
  bulbOff: string;
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
  bulbOn: '--bulb-on',
  bulbOff: '--bulb-off',
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
  bulbOn: '#f2c45a',
  bulbOff: '#cbb68d',
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

const FALLBACK_STACK = "Georgia, 'Times New Roman', serif";

/**
 * `ctx.font` no resuelve `var(--font-fraunces)`: si la cadena no es válida el
 * canvas ignora la asignación en silencio y sigue con la fuente anterior. Por
 * eso resolvemos aquí el nombre real que genera `next/font`.
 */
export function readWheelLabelFont(): string {
  if (typeof window === 'undefined') return `700 19px ${FALLBACK_STACK}`;
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-fraunces').trim();
  return `700 19px ${family ? `${family}, ` : ''}${FALLBACK_STACK}`;
}
