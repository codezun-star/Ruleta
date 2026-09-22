/**
 * Gráficos de papelería de feria. Se dibujan en SVG y heredan el color de la
 * tinta actual, así que sirven igual en modo día y en modo noche.
 */

const FLAG_COLORS = [
  'var(--vermilion)',
  'var(--mustard)',
  'var(--matcha)',
  'var(--sakura)',
  'var(--wood)'
] as const;

const FLAG_WIDTH = 56;
const PAPEL_TILE = FLAG_WIDTH * FLAG_COLORS.length;

/**
 * Una banderita de papel picado: cuerpo en punta y tres calados reales
 * (`evenodd`), no tapados con el color del fondo, para que la tira funcione
 * sobre cualquier superficie.
 */
function flagPath(offset: number) {
  const x = (n: number) => n + offset;
  return [
    `M${x(4)} 3H${x(52)}V30L${x(28)} 42L${x(4)} 30Z`,
    `M${x(22)} 14a6 6 0 1 1 12 0a6 6 0 1 1 -12 0Z`,
    `M${x(14)} 20L${x(18)} 24L${x(14)} 28L${x(10)} 24Z`,
    `M${x(42)} 20L${x(46)} 24L${x(42)} 28L${x(38)} 24Z`
  ].join('');
}

/** Tira de papel picado colgada de un cordel. */
export function PapelPicado({className}: {className?: string}) {
  return (
    <svg className={className} height="46" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="papel-picado" width={PAPEL_TILE} height="46" patternUnits="userSpaceOnUse">
          <path d={`M0 3H${PAPEL_TILE}`} stroke="var(--ink)" strokeWidth="1.6" fill="none" />
          {FLAG_COLORS.map((color, i) => (
            <path key={color} d={flagPath(i * FLAG_WIDTH)} fill={color} fillRule="evenodd" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="46" fill="url(#papel-picado)" />
    </svg>
  );
}

export type PatternName = 'rombos' | 'rayas';

const TILES: Record<PatternName, {size: number; path: string}> = {
  /** Retícula de rombos, como el orillo de un boleto de rifa. */
  rombos: {
    size: 32,
    path: [
      [16, 16],
      [0, 0],
      [32, 0],
      [0, 32],
      [32, 32]
    ]
      .map(
        ([cx = 0, cy = 0]) =>
          `M${cx} ${cy - 15}L${cx + 15} ${cy}L${cx} ${cy + 15}L${cx - 15} ${cy}Z`
      )
      .join('')
  },
  /** Rayas diagonales de cartel impreso. */
  rayas: {size: 16, path: 'M-4 20L20 -4M-4 4L4 -4M12 20L20 12'}
};

/** Textura de fondo. Siempre a baja opacidad: es papel, no contenido. */
export function PatternBand({
  pattern,
  className,
  opacity = 0.16
}: {
  pattern: PatternName;
  className?: string;
  opacity?: number;
}) {
  // Id fijo por patrón: el contenido es idéntico allá donde se repita.
  const id = `pattern-${pattern}`;
  const tile = TILES[pattern];

  return (
    <svg className={className} aria-hidden="true" focusable="false" style={{opacity}}>
      <defs>
        <pattern id={id} width={tile.size} height={tile.size} patternUnits="userSpaceOnUse">
          <path d={tile.path} fill="none" stroke="currentColor" strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
