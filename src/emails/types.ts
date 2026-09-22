export type EmailBrand = {
  siteUrl: string;
  domain: string;
  /** Textos comunes del pie y las imágenes, ya traducidos. */
  bannerAlt: string;
  sealAlt: string;
  footerWhy: string;
  footerRetention: string;
  reportLabel: string;
  drawIdLabel: string;
  drawId: string;
};

export type SecretSantaEmailProps = {
  brand: EmailBrand;
  greeting: string;
  intro: string;
  youGiveLabel: string;
  receiverName: string;
  budget?: string;
  budgetLabel: string;
  date?: string;
  dateLabel: string;
  place?: string;
  placeLabel: string;
  message?: string;
  messageLabel: string;
  keep: string;
};

export type RaffleWinnerEmailProps = {
  brand: EmailBrand;
  greeting: string;
  headline: string;
  intro: string;
  prizeLabel: string;
  prize: string;
  positionLabel: string;
  winnerName: string;
};

export type RaffleParticipantEmailProps = {
  brand: EmailBrand;
  greeting: string;
  headline: string;
  intro: string;
  prizeLabel: string;
  prize: string;
  winnersLabel: string;
  winners: string[];
};

export type OrganizerReceiptEmailProps = {
  brand: EmailBrand;
  headline: string;
  intro: string;
  rows: {label: string; value: string}[];
  privacy: string;
  retry: string;
};
