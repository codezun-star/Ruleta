import {useTranslations} from 'next-intl';
import {BRAND} from '@/config/brand';
import {SealMark} from '@/components/ui/SealMark';
import {Link} from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8">
        <p className="flex items-center gap-2.5 font-head text-lg font-black">
          <SealMark size={26} />
          {BRAND.name}
          <span className="font-sans text-sm font-normal opacity-75">· {t('tagline')}</span>
        </p>
        <p className="text-sm opacity-75">{t('retention')}</p>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/privacidad"
            className="text-paper underline underline-offset-4 opacity-85 hover:opacity-100"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terminos"
            className="text-paper underline underline-offset-4 opacity-85 hover:opacity-100"
          >
            {t('terms')}
          </Link>
          <span className="opacity-75">{BRAND.domain}</span>
        </nav>
      </div>
    </footer>
  );
}
