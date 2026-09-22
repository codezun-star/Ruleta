import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getFormatter, getTranslations, setRequestLocale} from 'next-intl/server';
import {Link, getPathname} from '@/i18n/navigation';
import {BRAND} from '@/config/brand';
import {Markdown, readingMinutes, splitAtHeading} from '@/lib/markdown';
import {POSTS, findPost, relatedTo} from '@/content/posts';
import {localizeLinks} from '@/content/posts/links';
import {BreadcrumbData} from '@/components/seo/StructuredData';
import {BlogPostData} from '@/components/seo/BlogData';
import {StampLink} from '@/components/ui/StampButton';
import {AdBanner, AdLeaderboard} from '@/components/ads/AdBanner';
import {AdNative} from '@/components/ads/AdNative';
import {AdOverlay} from '@/components/ads/AdOverlay';

type Params = Promise<{locale: string; slug: string}>;

export function generateStaticParams() {
  return POSTS.map((post) => ({locale: post.locale, slug: post.slug}));
}

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = findPost(locale, slug);
  if (!post) return {};

  return {
    title: post.seoTitle,
    description: post.description,
    keywords: [post.keyword],
    // Un artículo existe solo en su idioma, así que declara canonical pero no
    // `hreflang`: apuntaría a traducciones que no hay, es decir, a un 404.
    alternates: {
      canonical: getPathname({href: {pathname: '/blog/[slug]', params: {slug}}, locale})
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [BRAND.name]
    },
    twitter: {card: 'summary_large_image', title: post.title, description: post.description}
  };
}

export default async function BlogPost({params}: {params: Params}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const post = findPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({locale, namespace: 'blog'});
  const format = await getFormatter({locale});
  const related = relatedTo(post);

  // El artículo se parte por su tercera sección para dejar un anuncio en medio
  // del texto, que es donde mejor rinde sin cortar la lectura de entrada.
  const [opening, rest] = splitAtHeading(localizeLinks(post.body, locale), 3);

  const date = (value: string) =>
    format.dateTime(new Date(value), {day: 'numeric', month: 'long', year: 'numeric'});

  return (
    <>
      <BreadcrumbData
        locale={locale}
        href={{pathname: '/blog/[slug]', params: {slug: post.slug}}}
        name={post.title}
        parent={{href: '/blog', name: t('heading')}}
      />
      <BlogPostData locale={locale} post={post} />

      <article className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[42rem] px-5">
          <Link
            href="/blog"
            className="text-[0.72rem] font-bold tracking-[0.18em] text-vermilion-2 uppercase underline-offset-4 hover:underline"
          >
            ← {t('backToBlog')}
          </Link>

          <h1 className="mt-5 font-head text-3xl leading-[1.1] font-black tracking-tight text-balance sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-bold tracking-[0.18em] text-ink-2 uppercase">
            <time dateTime={post.updated ?? post.published}>
              {post.updated
                ? t('updated', {date: date(post.updated)})
                : t('published', {date: date(post.published)})}
            </time>
            <span aria-hidden="true" className="size-1 rounded-full bg-hairline" />
            <span>{t('readingTime', {minutes: readingMinutes(post.body)})}</span>
          </p>

          <hr className="mt-6 border-t-2 border-ink" />

          <div className="mt-2 text-[1.0625rem] leading-relaxed [&>p]:mt-4">
            <Markdown content={opening} />
            {rest ? (
              <>
                <AdBanner unit="rectangle" className="my-10" />
                <Markdown content={rest} />
              </>
            ) : null}
          </div>

          <AdLeaderboard className="mt-12" />

          <aside className="mt-12 border-2 border-ink bg-paper-2 p-6">
            <p className="font-head text-xl font-black text-balance">{post.cta.blurb}</p>
            <div className="mt-5">
              <StampLink href={post.cta.href}>{post.cta.label}</StampLink>
            </div>
          </aside>

          <section className="mt-12">
            <h2 className="font-head text-2xl font-black">{t('faqHeading')}</h2>
            <dl className="mt-5 flex flex-col">
              {post.faq.map((item) => (
                <div
                  key={item.q}
                  className="border-t border-hairline py-5 first:border-t-0 first:pt-0"
                >
                  <dt className="font-head text-lg leading-snug font-black text-balance">
                    {item.q}
                  </dt>
                  <dd className="mt-2 text-ink-2">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {related.length > 0 ? (
            <section className="mt-12 border-t-2 border-ink pt-8">
              <h2 className="font-head text-2xl font-black">{t('related')}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={{pathname: '/blog/[slug]', params: {slug: other.slug}}}
                      className="group flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermilion"
                    >
                      <span className="font-head text-lg leading-snug font-black text-balance underline-offset-4 group-hover:underline">
                        {other.title}
                      </span>
                      <span className="text-sm text-ink-2">{other.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <AdNative className="mt-12" />
        </div>
      </article>

      {/* Solo aquí: es la única página donde alguien está leyendo y no a mitad
          de un sorteo. */}
      <AdOverlay />
    </>
  );
}
