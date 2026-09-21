import {cn} from '@/lib/cn';

/**
 * Kanji decorativo. El lector de pantalla oye la traducción, no el japonés:
 * el idioma real de la interfaz sigue siendo el del usuario.
 */
export function JaGlyph({
  glyph,
  meaning,
  className
}: {
  glyph: string;
  meaning: string;
  className?: string;
}) {
  return (
    <span className={cn('font-ja', className)} lang="ja" role="img" aria-label={meaning}>
      {glyph}
    </span>
  );
}
