import {getTranslations} from 'next-intl/server';
import {getPathname} from '@/i18n/navigation';
import {BRAND, SITE_URL} from '@/config/brand';
import {countWords} from '@/lib/markdown';
import type {Post} from '@/content/posts';

/** `<` dentro del JSON cerraría el `<script>` antes de tiempo. */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const absolute = (path: string) => `${SITE_URL}${path}`;

function postUrl(post: Post, locale: string): string {
  return absolute(
    getPathname({href: {pathname: '/blog/[slug]', params: {slug: post.slug}}, locale})
  );
}

function Json({data}: {data: unknown}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: safeJson(data)}} />;
}

/** El índice: una lista de artículos, que es lo que Google espera de un blog. */
export async function BlogListData({locale, posts}: {locale: string; posts: Post[]}) {
  const t = await getTranslations({locale, namespace: 'blog'});
  const url = absolute(getPathname({href: '/blog', locale}));

  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${url}#blog`,
        name: t('heading'),
        description: t('lede'),
        inLanguage: locale,
        url,
        publisher: {'@id': `${SITE_URL}/#organization`},
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          '@id': `${postUrl(post, locale)}#article`,
          headline: post.title,
          description: post.description,
          datePublished: post.published,
          dateModified: post.updated ?? post.published,
          url: postUrl(post, locale)
        }))
      }}
    />
  );
}

/**
 * El artículo: `BlogPosting` más un `FAQPage` con las preguntas del pie. Las
 * respuestas del marcado son literalmente las mismas que se pintan en la
 * página —salen del mismo campo— porque Google exige que el contenido de un
 * `FAQPage` esté visible y descarta el marcado que no encuentra en el texto.
 */
export function BlogPostData({locale, post}: {locale: string; post: Post}) {
  const url = postUrl(post, locale);

  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            '@id': `${url}#article`,
            headline: post.title,
            alternativeHeadline: post.seoTitle,
            description: post.description,
            keywords: post.keyword,
            wordCount:
              countWords(post.body) +
              post.faq.reduce((sum, item) => sum + countWords(item.q) + countWords(item.a), 0),
            inLanguage: locale,
            url,
            mainEntityOfPage: {'@type': 'WebPage', '@id': url},
            datePublished: post.published,
            dateModified: post.updated ?? post.published,
            author: {'@type': 'Organization', name: BRAND.name, url: SITE_URL},
            publisher: {'@id': `${SITE_URL}/#organization`},
            isPartOf: {'@id': `${absolute(getPathname({href: '/blog', locale}))}#blog`}
          },
          {
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            inLanguage: locale,
            mainEntity: post.faq.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {'@type': 'Answer', text: item.a}
            }))
          }
        ]
      }}
    />
  );
}
