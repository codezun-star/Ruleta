'use client';

import {useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ListInput, parseLines} from './ListInput';
import {Wheel} from '@/components/wheel/Wheel';
import {StampButton} from '@/components/ui/StampButton';
import {LIMITS} from '@/lib/validation/limits';

const MIN_OPTIONS = 2;

export function DecisionTool() {
  const t = useTranslations('decide');
  const tools = useTranslations('tools');
  const [text, setText] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const options = useMemo(() => parseLines(text, LIMITS.max), [text]);
  const ready = options.length >= MIN_OPTIONS && options.length <= LIMITS.max;

  if (spinning) {
    return (
      <div className="flex flex-col gap-6">
        <Wheel
          labels={options}
          ambient={false}
          copy={{spin: t('spin'), again: t('again'), caption: t('caption'), seal: t('seal')}}
        />
        <StampButton
          variant="ghost"
          size="sm"
          className="self-center"
          onClick={() => setSpinning(false)}
        >
          {tools('edit')}
        </StampButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ListInput
        id="opciones"
        value={text}
        onChange={setText}
        placeholder={t('placeholder')}
        min={MIN_OPTIONS}
        max={LIMITS.max}
        showError={attempted}
      />
      <StampButton
        className="self-start"
        onClick={() => (ready ? setSpinning(true) : setAttempted(true))}
      >
        {t('spin')}
      </StampButton>
    </div>
  );
}
