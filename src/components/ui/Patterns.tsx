/**
 * Patrones tradicionales redibujados en SVG con línea fina. Heredan el color
 * de la tinta actual, así que sirven igual en modo día y en modo noche.
 * Se usan como bandas y bordes, nunca como papel tapiz de página completa.
 */
const FAN_RADII = [26, 18.7, 12, 5.7];

function seigaihaPaths() {
  const R = 26;
  const H = R / 2;
  const items: {fill: string; arcs: string}[] = [];
  // De arriba abajo: cada abanico se rellena y tapa al de detrás, que es lo
  // que convierte un enrejado de arcos en escamas de ola.
  for (let row = -4; row <= 8; row++) {
    const cy = row * H;
    const offset = Math.abs(row % 2) === 1 ? R / 2 : 0;
    for (let x = -2 * R + offset; x <= 4 * R; x += R) {
      items.push({
        fill: `M${x - R} ${cy}A${R} ${R} 0 0 1 ${x + R} ${cy}Z`,
        arcs: FAN_RADII.map((r) => `M${x - r} ${cy}A${r} ${r} 0 0 1 ${x + r} ${cy}`).join('')
      });
    }
  }
  return items;
}

function asanohaPath() {
  const R = 24;
  const W = Math.sqrt(3) * R;
  const vertex = (cx: number, cy: number, i: number): [number, number] => {
    const a = ((60 * i - 90) * Math.PI) / 180;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  };
  let d = '';
  for (let row = -1; row <= 3; row++) {
    const cy = row * 1.5 * R;
    const offset = Math.abs(row % 2) === 1 ? W / 2 : 0;
    for (let col = -1; col <= 2; col++) {
      const cx = col * W + offset;
      for (let i = 0; i < 6; i++) {
        const [x1, y1] = vertex(cx, cy, i);
        const [x2, y2] = vertex(cx, cy, i + 1);
        d += `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
        d += `M${cx.toFixed(2)} ${cy.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
      }
    }
  }
  return {d, width: W, height: 3 * R};
}

export type PatternName = 'seigaiha' | 'asanoha' | 'shippo';

/**
 * Banda decorativa. `opacity` baja porque el patrón es textura, no contenido.
 */
export function PatternBand({
  pattern,
  className,
  opacity = 0.22
}: {
  pattern: PatternName;
  className?: string;
  opacity?: number;
}) {
  // Id fijo por patrón: el contenido es idéntico allá donde se repita.
  const id = `pattern-${pattern}`;
  const asanoha = asanohaPath();

  return (
    <svg className={className} aria-hidden="true" focusable="false" style={{opacity}}>
      <defs>
        {pattern === 'seigaiha' && (
          <pattern id={id} width="52" height="26" patternUnits="userSpaceOnUse">
            {seigaihaPaths().map((fan, i) => (
              <g key={i}>
                <path d={fan.fill} fill="var(--paper)" />
                <path d={fan.arcs} fill="none" stroke="currentColor" strokeWidth="1.1" />
              </g>
            ))}
          </pattern>
        )}
        {pattern === 'asanoha' && (
          <pattern
            id={id}
            width={asanoha.width.toFixed(3)}
            height={asanoha.height.toFixed(3)}
            patternUnits="userSpaceOnUse"
          >
            <path d={asanoha.d} fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        )}
        {pattern === 'shippo' && (
          <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.1">
              {[0, 20, 40].map((cx) =>
                [0, 20, 40].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="20" />)
              )}
            </g>
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
