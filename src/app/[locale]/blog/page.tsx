import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getFormatter, getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {alternatesFor} from '@/lib/metadata';
import {readingMinutes} from '@/lib/markdown';
import {postsFor} from '@/content/posts';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {BlogListData} from '@/components/seo/BlogData';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {AdBanner, AdLeaderboard} from '@/components/ads/AdBanner';
import {AdNative} from '@/components/ads/AdNative';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'blog'});
  return {
    title: t('heading'),
    description: t('lede'),
    alternates: alternatesFor('/blog', locale)
  };
}

export default async function BlogIndex({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'blog'});
  const format = await getFormatter({locale});

  const posts = postsFor(locale);
  // Un índice vacío es una página sin contenido que Google indexaría igual.
  if (posts.length === 0) notFound();

  return (
    <>
      <BreadcrumbData locale={locale} href={'/blog'} name={t('heading')} />
      <BlogListData locale={locale} posts={posts} />
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-5">
          <SectionHeading as="h1" eyebrow={t('title')} title={t('heading')} lede={t('lede')} />

          <AdLeaderboard className="mt-8" />

          <ul className="mt-10 flex flex-col">
            {posts.map((post, index) => (
              <li key={post.slug} className="border-t-2 border-ink first:border-t-0">
                <Link
                  href={{pathname: '/blog/[slug]', params: {slug: post.slug}}}
                  className="group flex flex-col gap-2 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermilion"
                >
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-bold tracking-[0.18em] text-ink-2 uppercase">
                    <time dateTime={post.published}>
                      {format.dateTime(new Date(post.published), {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </time>
                    <span aria-hidden="true" className="size-1 rounded-full bg-hairline" />
                    <span>{t('readingTime', {minutes: readingMinutes(post.body)})}</span>
                  </p>
                  <h2 className="font-head text-2xl leading-tight font-black text-balance underline-offset-4 group-hover:underline sm:text-3xl">
                    {post.title}
                  </h2>
                  <p className="max-w-[62ch] text-ink-2">{post.description}</p>
                </Link>
                {/* Uno solo, y a la altura del tercer artículo: el nativo
                    lleva un contenedor con id fijo de la red, así que dos en
                    la misma página dejan uno sin rellenar. Y una lista donde
                    se alternan entrada y anuncio deja de leerse como lista. */}
                {index === 2 && index < posts.length - 1 ? <AdNative className="mb-7" /> : null}
              </li>
            ))}
          </ul>

          <AdBanner unit="rectangle" className="mt-10" />
        </div>
      </section>
    </>
  );
}
