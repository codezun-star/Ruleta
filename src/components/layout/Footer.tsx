import {useTranslations} from 'next-intl';
import {BRAND} from '@/config/brand';
import {HankoMark} from '@/components/ui/HankoMark';
import {JaGlyph} from '@/components/ui/JaGlyph';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8">
        <p className="flex items-center gap-2.5 font-head text-lg font-black">
          <HankoMark size={26} />
          {BRAND.name}
          <span className="font-sans text-sm font-normal opacity-75">· {t('tagline')}</span>
        </p>
        <p className="text-sm opacity-75">{t('retention')}</p>
        <p className="text-sm opacity-75">
          {BRAND.domain} · <JaGlyph glyph="お楽しみに" meaning={t('enjoy')} /> ({t('enjoy')})
        </p>
      </div>
    </footer>
  );
}
