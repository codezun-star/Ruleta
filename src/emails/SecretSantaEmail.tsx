import {Section, Text} from '@react-email/components';
import {
  DetailRow,
  EmailFrame,
  INK_SOFT,
  Paragraph,
  SealedValue,
  Title
} from './components/EmailFrame';
import type {SecretSantaEmailProps} from './types';

export function SecretSantaEmail(props: SecretSantaEmailProps) {
  const {brand} = props;

  return (
    <EmailFrame
      preview={props.intro}
      siteUrl={brand.siteUrl}
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
        label={props.youGiveLabel}
        value={props.receiverName}
      />

      <Section style={{paddingTop: '16px'}}>
        {props.budget ? <DetailRow label={props.budgetLabel} value={props.budget} /> : null}
        {props.date ? <DetailRow label={props.dateLabel} value={props.date} /> : null}
        {props.place ? <DetailRow label={props.placeLabel} value={props.place} /> : null}
        {props.message ? <DetailRow label={props.messageLabel} value={props.message} /> : null}
        <DetailRow label={brand.drawIdLabel} value={brand.drawId} />
      </Section>

      <Text style={{margin: '18px 0 0', fontSize: '14px', lineHeight: '20px', color: INK_SOFT}}>
        {props.keep}
      </Text>
    </EmailFrame>
  );
}

export default SecretSantaEmail;
