import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {BRAND} from '@/config/brand';
import {SealMark} from '@/components/ui/SealMark';
import {LocaleSwitcher} from './LocaleSwitcher';
import {ThemeToggle} from './ThemeToggle';
import {SoundToggle} from './SoundToggle';

export function Header() {
  const t = useTranslations('nav');

  return (
    <header
      className="sticky z-50 border-b-2 border-ink bg-paper-2"
      style={{top: 'env(safe-area-inset-top, 0px)'}}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-head text-lg font-black tracking-tight"
        >
          <SealMark size={28} />
          {BRAND.name}
        </Link>

        <nav aria-label={t('how')} className="ml-auto hidden items-center gap-5 md:flex">
          <a
            href="#modos"
            className="text-xs font-bold tracking-[0.12em] text-ink-2 uppercase hover:text-vermilion-2"
          >
            {t('games')}
          </a>
          <a
            href="#como-funciona"
            className="text-xs font-bold tracking-[0.12em] text-ink-2 uppercase hover:text-vermilion-2"
          >
            {t('how')}
          </a>
          <a
            href="#preguntas"
            className="text-xs font-bold tracking-[0.12em] text-ink-2 uppercase hover:text-vermilion-2"
          >
            {t('faq')}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <LocaleSwitcher />
          <ThemeToggle />
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}
