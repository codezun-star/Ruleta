import {useTranslations} from 'next-intl';
import {StampLink} from '@/components/ui/StampButton';
import {JaGlyph} from '@/components/ui/JaGlyph';
import {PatternBand} from '@/components/ui/Patterns';
import {WheelCanvas} from '@/components/wheel/WheelCanvas';

/** Nombres de muestra: la ruleta de portada tiene que verse llena de gente. */
const DEMO_NAMES = ['Ana', 'Kenji', 'Marisol', 'Diego', 'Yuki', 'Camila', 'Rubén', 'Sora'];

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden border-b-[3px] border-ink">
      <PatternBand
        pattern="seigaiha"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-ink [mask-image:linear-gradient(to_top,#000,transparent)]"
        opacity={0.4}
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:py-16">
        <div>
          <p className="text-[0.72rem] font-bold tracking-[0.22em] text-vermilion-2 uppercase">
            {t('eyebrow')}
          </p>
          <p className="mt-4 font-ja text-5xl leading-none text-vermilion sm:text-6xl">
            <JaGlyph glyph="福引" meaning={t('eyebrow')} />
          </p>
          <h1 className="mt-1 font-head text-display font-black text-balance">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-ink-2">{t('lede')}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <StampLink href="/sorteo">{t('primaryCta')}</StampLink>
            <StampLink href="/amigo-secreto" variant="secondary">
              {t('secondaryCta')}
            </StampLink>
          </div>
          <p className="mt-4 text-sm text-ink-2">{t('note')}</p>
        </div>

        <WheelCanvas labels={DEMO_NAMES} label={t('wheelLabel')} />
      </div>
    </section>
  );
}
