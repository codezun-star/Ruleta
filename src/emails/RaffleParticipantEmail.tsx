import {Section, Text} from '@react-email/components';
import {DetailRow, EmailFrame, HEAD_FONT, INK, Paragraph, Title} from './components/EmailFrame';
import type {RaffleParticipantEmailProps} from './types';

export function RaffleParticipantEmail(props: RaffleParticipantEmailProps) {
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

      <Section style={{paddingTop: '4px'}}>
        <Text
          style={{
            margin: '0 0 8px',
            fontSize: '11px',
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: '#33455e'
          }}
        >
          {props.winnersLabel}
        </Text>
        {props.winners.map((name, index) => (
          <Text
            key={name}
            style={{
              margin: '0 0 6px',
              fontFamily: HEAD_FONT,
              fontSize: '20px',
              lineHeight: '26px',
              fontWeight: 'bold',
              color: INK
            }}
          >
            {index + 1}. {name}
          </Text>
        ))}
      </Section>

      <Section style={{paddingTop: '16px'}}>
        <DetailRow label={props.prizeLabel} value={props.prize} />
        <DetailRow label={brand.drawIdLabel} value={brand.drawId} />
      </Section>
    </EmailFrame>
  );
}

export default RaffleParticipantEmail;
