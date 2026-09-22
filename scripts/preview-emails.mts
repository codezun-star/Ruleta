/** Renderiza los cuatro correos a HTML para poder mirarlos. */
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  renderOrganizerReceipt,
  renderRaffleParticipant,
  renderRaffleWinner,
  renderSecretSanta
} from '../src/emails/render';

const OUT = process.argv[2] ?? resolve(process.cwd(), 'email-preview');
mkdirSync(OUT, {recursive: true});

const drawId = 'PUR-Q77R';

const emails = {
  'amigo-secreto': await renderSecretSanta({
    locale: 'es',
    drawId,
    giverName: 'Ana Robles',
    receiverName: 'Kenji Morales',
    budget: '$25.000 COP',
    date: '20 de diciembre de 2026',
    place: 'Casa de Ana',
    message: 'Nada de calcetines, por favor.'
  }),
  'sorteo-ganador': await renderRaffleWinner({
    locale: 'es',
    drawId,
    winnerName: 'Marisol Cadena',
    prize: 'Una caja de chocolates',
    position: 1
  }),
  'sorteo-participante': await renderRaffleParticipant({
    locale: 'es',
    drawId,
    name: 'Diego Restrepo',
    prize: 'Una caja de chocolates',
    winners: ['Marisol Cadena', 'Ana Robles']
  }),
  organizador: await renderOrganizerReceipt({
    locale: 'es',
    drawId,
    rows: [
      {label: 'Participantes', value: '4'},
      {label: 'Premio', value: 'Una caja de chocolates'},
      {label: 'Ganadores', value: 'Marisol Cadena, Ana Robles'},
      {label: 'Correos enviados', value: '4'},
      {label: 'Envíos fallidos', value: '0'}
    ]
  }),
  'secret-santa-en': await renderSecretSanta({
    locale: 'en',
    drawId,
    giverName: 'Ana Robles',
    receiverName: 'Kenji Morales',
    budget: '$25 USD',
    date: 'December 20, 2026',
    place: "Ana's place",
    message: 'No socks, please.'
  })
};

for (const [name, email] of Object.entries(emails)) {
  writeFileSync(resolve(OUT, `${name}.html`), email.html);
  writeFileSync(resolve(OUT, `${name}.txt`), `Asunto: ${email.subject}\n\n${email.text}`);
}
console.log(`Escritos ${Object.keys(emails).length} correos en ${OUT}`);
