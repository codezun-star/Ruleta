import {useTranslations} from 'next-intl';
import {StampLink} from '@/components/ui/StampButton';
import {JaGlyph} from '@/components/ui/JaGlyph';
import {PatternBand} from '@/components/ui/Patterns';

export function FinalCta() {
  const t = useTranslations('home.finalCta');

  return (
    <section className="relative overflow-hidden py-16 text-center sm:py-24">
      <PatternBand
        pattern="asanoha"
        className="pointer-events-none absolute inset-0 h-full w-full text-ink"
        opacity={0.14}
      />
      <div className="relative mx-auto w-full max-w-6xl px-5">
        <p className="font-ja text-3xl text-vermilion">
          <JaGlyph glyph="大当たり" meaning={t('title')} />
        </p>
        <h2 className="mt-2 font-head text-4xl font-black text-balance sm:text-5xl">{t('title')}</h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-lg text-ink-2">{t('body')}</p>
        <div className="mt-7 flex justify-center">
          <StampLink href="/sorteo">{t('button')}</StampLink>
        </div>
      </div>
    </section>
  );
}
