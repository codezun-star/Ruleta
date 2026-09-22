import type {StaticPathname} from '@/i18n/routing';

export type Post = {
  slug: string;
  locale: 'es' | 'en';
  /** Titular del artículo. Va en el h1 y en Open Graph. */
  title: string;
  /** Título de la pestaña y del resultado de búsqueda. Puede ser distinto. */
  seoTitle: string;
  /** Meta description: entre 120 y 160 caracteres o Google la recorta. */
  description: string;
  /** Término de cola larga al que apunta el artículo. */
  keyword: string;
  published: string;
  updated?: string;
  body: string;
  /**
   * Preguntas del pie. Se pintan en la página y se emiten como `FAQPage`: si
   * solo fueran marcado, Google lo descartaría por no encontrarlas en el texto.
   */
  faq: {q: string; a: string}[];
  /** A qué herramienta empuja el artículo. */
  cta: {href: StaticPathname; label: string; blurb: string};
  /** Slugs de artículos relacionados; se filtran los que no existan. */
  related: string[];
};
