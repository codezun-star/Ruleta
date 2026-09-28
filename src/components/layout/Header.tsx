import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {BRAND} from '@/config/brand';
import {SealMark} from '@/components/ui/SealMark';
import {LocaleSwitcher} from './LocaleSwitcher';
import {ThemeToggle} from './ThemeToggle';
import {SoundToggle} from './SoundToggle';
import {AppMenu} from './AppMenu';
import {BackButton} from './BackButton';
import {postsFor} from '@/content/posts';

const SECTIONS = [
  {hash: '#modos', key: 'games'},
  {hash: '#como-funciona', key: 'how'},
  {hash: '#preguntas', key: 'faq'}
] as const;

/**
 * En escritorio, una cabecera de web: logotipo, secciones y ajustes a la
 * vista. En móvil, la barra superior de una app: flecha de volver en las
 * páginas interiores, el sonido —que es lo único que se toca a menudo— y el
 * botón del menú, donde queda todo lo demás.
 */
export function Header() {
  const t = useTranslations('nav');
  // El blog vive por idioma: sin artículos, su índice devuelve 404.
  const hasBlog = postsFor(useLocale()).length > 0;

  return (
    <header className="pt-safe sticky top-0 z-50 border-b-2 border-ink bg-paper-2">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-5 md:gap-4">
        <BackButton />

        <Link
          href="/"
          className="flex h-11 shrink-0 items-center gap-2.5 font-head text-lg font-black tracking-tight"
        >
          <SealMark size={28} />
          {BRAND.name}
        </Link>

        <nav aria-label={t('how')} className="ml-auto hidden items-center gap-5 md:flex">
          {/*
            Los anclajes llevan la portada delante a propósito: un `#modos` a
            secas no existe fuera de ella, y desde un artículo del blog no
            llevaba a ninguna parte.
          */}
          {SECTIONS.map((section) => (
            <Link
              key={section.hash}
              href={{pathname: '/', hash: section.hash}}
              className="text-xs font-bold tracking-[0.12em] text-ink-2 uppercase hover:text-vermilion-2"
            >
              {t(section.key)}
            </Link>
          ))}
          {hasBlog ? (
            <Link
              href="/blog"
              className="text-xs font-bold tracking-[0.12em] text-ink-2 uppercase hover:text-vermilion-2"
            >
              {t('blog')}
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="hidden items-center gap-2 md:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <SoundToggle />
          <AppMenu hasBlog={hasBlog} />
        </div>
      </div>
    </header>
  );
}
