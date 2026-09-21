import {useTranslations} from 'next-intl';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Tag} from '@/components/ui/Tag';
import {WizardSteps} from './WizardSteps';

/**
 * Armazón de las dos pantallas de configuración. El contenido del panel lo
 * sustituye el asistente de tres pasos en la fase siguiente.
 */
export function WizardShell({namespace, step}: {namespace: 'raffle' | 'secretSanta'; step: number}) {
  const t = useTranslations(namespace);
  const wip = useTranslations('wip');

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-4xl px-5">
        <SectionHeading step={step} eyebrow={t('title')} title={t('title')} lede={t('lede')} />

        <div className="mt-8">
          <WizardSteps current={1} />
        </div>

        <div
          className="double-frame mt-6 bg-paper-hi p-6 sm:p-8"
          style={{['--surface' as string]: 'var(--paper-hi)'}}
        >
          <Tag tone="alert">{wip('badge')}</Tag>
          <h2 className="mt-3 font-head text-2xl font-black">{wip('title')}</h2>
          <p className="mt-2 max-w-[56ch] text-ink-2">{wip('body')}</p>
        </div>
      </div>
    </section>
  );
}
