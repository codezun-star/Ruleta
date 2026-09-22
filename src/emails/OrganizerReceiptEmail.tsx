import {Section, Text} from '@react-email/components';
import {DetailRow, EmailFrame, INK_SOFT, Paragraph, Title} from './components/EmailFrame';
import type {OrganizerReceiptEmailProps} from './types';

export function OrganizerReceiptEmail(props: OrganizerReceiptEmailProps) {
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
      <Title>{props.headline}</Title>
      <Paragraph>{props.intro}</Paragraph>

      <Section>
        {props.rows.map((row) => (
          <DetailRow key={row.label} label={row.label} value={row.value} />
        ))}
        <DetailRow label={brand.drawIdLabel} value={brand.drawId} />
      </Section>

      <Text style={{margin: '18px 0 8px', fontSize: '14px', lineHeight: '20px', color: INK_SOFT}}>
        {props.privacy}
      </Text>
      <Text style={{margin: 0, fontSize: '14px', lineHeight: '20px', color: INK_SOFT}}>
        {props.retry}
      </Text>
    </EmailFrame>
  );
}

export default OrganizerReceiptEmail;
