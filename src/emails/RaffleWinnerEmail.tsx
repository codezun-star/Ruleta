import {Section} from '@react-email/components';
import {DetailRow, EmailFrame, Paragraph, SealedValue, Title} from './components/EmailFrame';
import type {RaffleWinnerEmailProps} from './types';

export function RaffleWinnerEmail(props: RaffleWinnerEmailProps) {
  const {brand} = props;

  return (
    <EmailFrame
      preview={props.intro}
      siteUrl={brand.siteUrl}
      privacyPath={brand.privacyPath}
      domain={brand.domain}
      bannerAlt={brand.bannerAlt}
      footerWhy={brand.footerWhy}
      footerRetention={brand.footerRetention}
      reportLabel={brand.reportLabel}
    >
      <Title>{props.greeting}</Title>
      <Paragraph>{props.intro}</Paragraph>

      <SealedValue
        siteUrl={brand.siteUrl}
        sealAlt={brand.sealAlt}
        label={props.headline}
        value={props.winnerName}
      />

      <Section style={{paddingTop: '16px'}}>
        <DetailRow label={props.prizeLabel} value={props.prize} />
        <DetailRow label={brand.drawIdLabel} value={brand.drawId} />
      </Section>

      <Paragraph>{props.positionLabel}</Paragraph>
    </EmailFrame>
  );
}

export default RaffleWinnerEmail;
