import {createTranslator} from 'next-intl';
import {render} from '@react-email/render';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import {BRAND, SITE_URL} from '@/config/brand';
import {SecretSantaEmail} from './SecretSantaEmail';
import {RaffleWinnerEmail} from './RaffleWinnerEmail';
import {RaffleParticipantEmail} from './RaffleParticipantEmail';
import {OrganizerReceiptEmail} from './OrganizerReceiptEmail';
import type {EmailBrand} from './types';
import {localePath} from '@/i18n/paths';

const MESSAGES = {es, en} as const;
type Locale = keyof typeof MESSAGES;

export type OutgoingEmail = {subject: string; html: string; text: string};

function translator(locale: string) {
  const resolved: Locale = locale === 'en' ? 'en' : 'es';
  return createTranslator({locale: resolved, messages: MESSAGES[resolved], namespace: 'emails'});
}

type Common = {locale: string; drawId: string};

function brandFor(t: ReturnType<typeof translator>, drawId: string, locale: string): EmailBrand {
  return {
    siteUrl: SITE_URL,
    domain: BRAND.domain,
    privacyPath: localePath('/privacidad', locale),
    bannerAlt: t('common.bannerAlt'),
    sealAlt: t('common.sealAlt'),
    footerWhy: t('common.footerWhy', {domain: BRAND.domain}),
    footerRetention: t('common.footerRetention'),
    reportLabel: t('common.footerUnsubscribe'),
    drawIdLabel: t('common.drawId'),
    drawId
  };
}

/** React Email también genera la versión en texto plano, que mejora la entrega. */
async function toEmail(subject: string, element: React.ReactElement): Promise<OutgoingEmail> {
  const [html, text] = await Promise.all([render(element), render(element, {plainText: true})]);
  return {subject, html, text};
}

export async function renderSecretSanta(
  options: Common & {
    receiverName: string;
    giverName: string;
    budget?: string;
    date?: string;
    place?: string;
    message?: string;
  }
): Promise<OutgoingEmail> {
  const t = translator(options.locale);
  return toEmail(
    t('secretSanta.subject'),
    SecretSantaEmail({
      brand: brandFor(t, options.drawId, options.locale),
      greeting: t('secretSanta.greeting', {name: options.giverName}),
      intro: t('secretSanta.intro'),
      youGiveLabel: t('secretSanta.youGive'),
      receiverName: options.receiverName,
      budget: options.budget,
      budgetLabel: t('secretSanta.budget'),
      date: options.date,
      dateLabel: t('secretSanta.date'),
      place: options.place,
      placeLabel: t('secretSanta.place'),
      message: options.message,
      messageLabel: t('secretSanta.messageFrom'),
      keep: t('secretSanta.keep')
    })
  );
}

export async function renderRaffleWinner(
  options: Common & {winnerName: string; prize: string; position: number}
): Promise<OutgoingEmail> {
  const t = translator(options.locale);
  return toEmail(
    t('raffleWinner.subject'),
    RaffleWinnerEmail({
      brand: brandFor(t, options.drawId, options.locale),
      greeting: t('raffleWinner.greeting', {name: options.winnerName}),
      headline: t('raffleWinner.headline'),
      intro: t('raffleWinner.intro'),
      prizeLabel: t('raffleWinner.prize'),
      prize: options.prize,
      positionLabel: t('raffleWinner.position', {position: options.position}),
      winnerName: options.winnerName
    })
  );
}

export async function renderRaffleParticipant(
  options: Common & {name: string; prize: string; winners: string[]}
): Promise<OutgoingEmail> {
  const t = translator(options.locale);
  return toEmail(
    t('raffleParticipant.subject'),
    RaffleParticipantEmail({
      brand: brandFor(t, options.drawId, options.locale),
      greeting: t('raffleParticipant.greeting', {name: options.name}),
      headline: t('raffleParticipant.headline'),
      intro: t('raffleParticipant.intro'),
      prizeLabel: t('raffleParticipant.prize'),
      prize: options.prize,
      winnersLabel: t('raffleParticipant.winners'),
      winners: options.winners
    })
  );
}

export async function renderOrganizerReceipt(
  options: Common & {rows: {label: string; value: string}[]}
): Promise<OutgoingEmail> {
  const t = translator(options.locale);
  return toEmail(
    t('organizer.subject'),
    OrganizerReceiptEmail({
      brand: brandFor(t, options.drawId, options.locale),
      headline: t('organizer.headline'),
      intro: t('organizer.intro'),
      rows: options.rows,
      privacy: t('organizer.privacy'),
      retry: t('organizer.retry')
    })
  );
}

/** Etiquetas del recibo del organizador, para armar `rows` desde el servidor. */
export function organizerLabels(locale: string) {
  const t = translator(locale);
  return {
    participants: t('organizer.participants'),
    sent: t('organizer.sent'),
    failed: t('organizer.failed'),
    prize: t('organizer.prize'),
    winners: t('organizer.winners')
  };
}
