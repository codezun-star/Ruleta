/**
 * Logotipo: sello hanko circular con una ruleta estilizada dentro.
 * Sin texto, para que no dependa de que una fuente haya cargado.
 */
export function HankoMark({size = 32, className}: {size?: number; className?: string}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="60" cy="60" r="52" fill="var(--vermilion)" />
      <g stroke="var(--on-vermilion)" strokeWidth="6" strokeLinecap="round">
        <path d="M60 22v14M60 84v14M22 60h14M84 60h14" />
        <path d="M33 33l10 10M77 77l10 10M87 33L77 43M43 77l-10 10" />
      </g>
      <circle cx="60" cy="60" r="38" fill="none" stroke="var(--on-vermilion)" strokeWidth="3" />
      <circle cx="60" cy="60" r="12" fill="var(--on-vermilion)" />
      {/* Puntero: la cuña que marca el segmento ganador. */}
      <path d="M60 4l9 16H51z" fill="var(--vermilion)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
