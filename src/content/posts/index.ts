import type {Post} from './types';
import {amigoSecretoOnline} from './amigo-secreto-online';
import {amigoSecretoDistancia} from './amigo-secreto-a-distancia';
import {queEsUnDerangement} from './que-es-un-derangement';
import {evitarQueTeToquePareja} from './evitar-que-te-toque-tu-pareja';
import {amigoSecretoOficina} from './amigo-secreto-en-la-oficina';
import {sortearEnVivo} from './sortear-en-vivo-sin-dudas';
import {ruletaOPapelitos} from './ruleta-de-nombres-o-papelitos';
import {equiposAlAzar} from './armar-equipos-al-azar';
import {ruletasQueNoSonAleatorias} from './ruletas-que-no-son-aleatorias';
import {sorteosEnRedes} from './sorteos-en-redes-sociales';

export const POSTS: Post[] = [
  amigoSecretoOnline,
  amigoSecretoDistancia,
  queEsUnDerangement,
  evitarQueTeToquePareja,
  amigoSecretoOficina,
  sortearEnVivo,
  ruletaOPapelitos,
  equiposAlAzar,
  ruletasQueNoSonAleatorias,
  sorteosEnRedes
];

/** Del más reciente al más antiguo, que es como se lee un blog. */
export function postsFor(locale: string): Post[] {
  return POSTS.filter((post) => post.locale === locale).sort((a, b) =>
    b.published.localeCompare(a.published)
  );
}

export function findPost(locale: string, slug: string): Post | undefined {
  return POSTS.find((post) => post.locale === locale && post.slug === slug);
}

/** Relacionados que existen de verdad, más rellenos si faltan. */
export function relatedTo(post: Post, count = 3): Post[] {
  const pool = postsFor(post.locale).filter((other) => other.slug !== post.slug);
  const picked = post.related
    .map((slug) => pool.find((other) => other.slug === slug))
    .filter((other): other is Post => other !== undefined);

  for (const other of pool) {
    if (picked.length >= count) break;
    if (!picked.includes(other)) picked.push(other);
  }
  return picked.slice(0, count);
}

export type {Post};
