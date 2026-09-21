import {useTranslations} from 'next-intl';
import {StampLink} from '@/components/ui/StampButton';
import {PapelPicado} from '@/components/ui/Patterns';
import {Wheel} from '@/components/wheel/Wheel';

/** Nombres de muestra: la ruleta de portada tiene que verse llena de gente. */
const DEMO_NAMES = ['Ana', 'Kenji', 'Marisol', 'Diego', 'Yuki', 'Camila', 'Rubén', 'Sora'];

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="border-b-[3px] border-ink">
      <PapelPicado className="block w-full" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-4 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:pb-16">
        <div>
          <p className="text-[0.72rem] font-bold tracking-[0.22em] text-vermilion-2 uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 font-head text-display font-black text-balance">
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

        <Wheel labels={DEMO_NAMES} />
      </div>
    </section>
  );
}
