import {describe, expect, it} from 'vitest';
import {POSTS, findPost, postsFor, relatedTo} from '@/content/posts';
import {parseInline} from '@/lib/markdown';
import {routing} from '@/i18n/routing';

describe('registro de artículos', () => {
  it('no repite slugs dentro de un idioma', () => {
    const ids = POSTS.map((post) => `${post.locale}/${post.slug}`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('solo declara idiomas que el sitio sirve', () => {
    for (const post of POSTS) {
      expect(routing.locales).toContain(post.locale);
    }
  });

  it('ordena del más reciente al más antiguo', () => {
    const dates = postsFor('es').map((post) => post.published);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it('no mezcla idiomas', () => {
    expect(postsFor('es').every((post) => post.locale === 'es')).toBe(true);
  });

  it('devuelve una lista vacía para un idioma sin artículos', () => {
    expect(postsFor('fr')).toEqual([]);
  });
});

describe('findPost', () => {
  it('encuentra el artículo de su idioma', () => {
    const post = POSTS[0] as (typeof POSTS)[number];
    expect(findPost(post.locale, post.slug)?.title).toBe(post.title);
  });

  it('no cruza idiomas: un slug español no existe en inglés', () => {
    const post = POSTS[0] as (typeof POSTS)[number];
    expect(findPost('en', post.slug)).toBeUndefined();
  });

  it('devuelve undefined para un slug inventado', () => {
    expect(findPost('es', 'articulo-que-no-existe')).toBeUndefined();
  });
});

describe('relatedTo', () => {
  it('nunca se incluye a sí mismo', () => {
    for (const post of POSTS) {
      expect(relatedTo(post).map((other) => other.slug)).not.toContain(post.slug);
    }
  });

  it('rellena hasta el número pedido aunque falten relacionados', () => {
    const post = {...(POSTS[0] as (typeof POSTS)[number]), related: []};
    expect(relatedTo(post, 3)).toHaveLength(3);
  });

  it('respeta el orden declarado en el artículo', () => {
    const post = POSTS.find((candidate) => candidate.related.length >= 2);
    expect(post).toBeDefined();
    const related = relatedTo(post!, 2).map((other) => other.slug);
    expect(related).toEqual(post!.related.slice(0, 2));
  });

  it('descarta relacionados inexistentes en vez de romper', () => {
    const post = {...(POSTS[0] as (typeof POSTS)[number]), related: ['nada-de-nada']};
    const related = relatedTo(post, 2);
    expect(related).toHaveLength(2);
    expect(related.map((other) => other.slug)).not.toContain('nada-de-nada');
  });
});

describe('enlaces internos de los artículos', () => {
  it('todo enlace relativo apunta a un artículo o a una ruta del sitio', () => {
    const known = new Set(Object.keys(routing.pathnames));

    for (const post of POSTS) {
      const links = post.body
        .split('\n')
        .flatMap((line) => parseInline(line))
        .filter((part): part is {type: 'link'; value: string; href: string} => part.type === 'link')
        .map((part) => part.href)
        .filter((href) => !href.startsWith('http'));

      for (const href of links) {
        const slug = href.startsWith('/blog/') ? href.slice('/blog/'.length) : null;
        if (slug) {
          expect(
            findPost(post.locale, slug),
            `${post.slug} enlaza a /blog/${slug}, que no existe en ${post.locale}`
          ).toBeDefined();
        } else {
          expect(known, `${post.slug} enlaza a ${href}`).toContain(href);
        }
      }
    }
  });
});
