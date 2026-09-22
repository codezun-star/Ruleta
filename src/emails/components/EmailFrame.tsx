import type {ReactNode} from 'react';
import {Body, Container, Head, Html, Img, Link, Preview, Section, Text} from '@react-email/components';

/**
 * Armazón de todos los correos. Tablas y estilos en línea, tipografías
 * web-safe: las webfonts no son fiables en Gmail ni en Outlook, así que
 * Georgia para los titulares y Arial para el cuerpo.
 */
export const INK = '#1b2a41';
export const INK_SOFT = '#33455e';
export const PAPER = '#f1e6cf';
export const CARD = '#fbf3e2';
export const VERMILION = '#c8382b';

export const HEAD_FONT = 'Georgia, "Times New Roman", serif';
export const BODY_FONT = 'Arial, Helvetica, sans-serif';

export function EmailFrame({
  preview,
  siteUrl,
  domain,
  bannerAlt,
  footerWhy,
  footerRetention,
  reportLabel,
  children
}: {
  preview: string;
  siteUrl: string;
  domain: string;
  bannerAlt: string;
  footerWhy: string;
  footerRetention: string;
  reportLabel: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{margin: 0, padding: 0, backgroundColor: PAPER, fontFamily: BODY_FONT}}>
        <Container style={{width: '100%', maxWidth: '600px', margin: '0 auto', padding: '0 0 32px'}}>
          <Img
            src={`${siteUrl}/email/papel-picado.png`}
            alt={bannerAlt}
            width="600"
            height="46"
            style={{display: 'block', width: '100%', maxWidth: '600px', height: 'auto'}}
          />

          {/* Marco de doble línea: dos tablas anidadas, que es lo único que
              respetan todos los clientes de correo. */}
          <Section
            style={{
              margin: '20px 16px 0',
              border: `2px solid ${INK}`,
              backgroundColor: CARD,
              padding: '4px'
            }}
          >
            <Section style={{border: `1px solid ${INK}`, padding: '28px 24px'}}>{children}</Section>
          </Section>

          <Section style={{padding: '20px 20px 0', textAlign: 'center'}}>
            <Text style={{margin: '0 0 6px', fontSize: '12px', lineHeight: '18px', color: INK_SOFT}}>
              {footerWhy}
            </Text>
            <Text style={{margin: '0 0 6px', fontSize: '12px', lineHeight: '18px', color: INK_SOFT}}>
              {footerRetention}
            </Text>
            <Text style={{margin: 0, fontSize: '12px', lineHeight: '18px'}}>
              <Link href={`${siteUrl}/es/privacidad`} style={{color: VERMILION}}>
                {reportLabel}
              </Link>
              <span style={{color: INK_SOFT}}> · {domain}</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Sello rojo con el valor destacado: lo que el lector busca al abrir. */
export function SealedValue({
  siteUrl,
  sealAlt,
  label,
  value
}: {
  siteUrl: string;
  sealAlt: string;
  label: string;
  value: string;
}) {
  return (
    <Section style={{textAlign: 'center', padding: '8px 0 4px'}}>
      <Img
        src={`${siteUrl}/email/sello.png`}
        alt={sealAlt}
        width="72"
        height="72"
        style={{display: 'block', margin: '0 auto 12px'}}
      />
      <Text
        style={{
          margin: '0 0 6px',
          fontFamily: BODY_FONT,
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: INK_SOFT
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: 0,
          fontFamily: HEAD_FONT,
          fontSize: '30px',
          lineHeight: '36px',
          fontWeight: 'bold',
          color: INK
        }}
      >
        {value}
      </Text>
    </Section>
  );
}

export function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <Section style={{borderTop: `1px solid rgba(27,42,65,0.2)`, padding: '10px 0'}}>
      <Text
        style={{
          margin: '0 0 2px',
          fontSize: '11px',
          letterSpacing: '1.6px',
          textTransform: 'uppercase',
          color: INK_SOFT
        }}
      >
        {label}
      </Text>
      <Text style={{margin: 0, fontSize: '16px', lineHeight: '22px', color: INK}}>{value}</Text>
    </Section>
  );
}

export function Title({children}: {children: ReactNode}) {
  return (
    <Text
      style={{
        margin: '0 0 12px',
        fontFamily: HEAD_FONT,
        fontSize: '26px',
        lineHeight: '32px',
        fontWeight: 'bold',
        color: INK
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({children}: {children: ReactNode}) {
  return (
    <Text style={{margin: '0 0 14px', fontSize: '16px', lineHeight: '24px', color: INK_SOFT}}>
      {children}
    </Text>
  );
}
