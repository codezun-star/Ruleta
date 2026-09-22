import {getTranslations} from 'next-intl/server';
import {getPathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {BRAND, SITE_URL} from '@/config/brand';
import {FAQ_KEYS} from '@/components/landing/Faq';
import {postsFor} from '@/content/posts';
import {LIMITS} from '@/lib/validation/limits';

export const dynamic = 'force-static';
export const revalidate = 86400;

/**
 * `/llms.txt`: resumen del sitio en Markdown para los asistentes que lo
 * rastrean. Se genera desde las mismas traducciones que la página, así que no
 * puede contradecirla, que es justo lo que le quita valor a un archivo así.
 */
async function sectionFor(locale: string): Promise<string> {
  const meta = await getTranslations({locale, namespace: 'meta'});
  const faq = await getTranslations({locale, namespace: 'faq'});
  const how = await getTranslations({locale, namespace: 'home.how'});
  const modes = await getTranslations({locale, namespace: 'home.modes'});
  const decide = await getTranslations({locale, namespace: 'decide'});
  const turns = await getTranslations({locale, namespace: 'turns'});
  const teams = await getTranslations({locale, namespace: 'teams'});

  const url = (href: Parameters<typeof getPathname>[0]['href']) =>
    `${SITE_URL}${getPathname({href, locale})}`;

  const steps = [1, 2, 3]
    .map((index) => `${index}. **${how(`step${index}.title`)}** — ${how(`step${index}.body`)}`)
    .join('\n');

  const questions = FAQ_KEYS.map((key) => `### ${faq(`${key}.q`)}\n\n${faq(`${key}.a`)}`).join(
    '\n\n'
  );

  // Los artículos, con su respuesta de entrada: un asistente que cite el sitio
  // debería poder citar la respuesta, no solo el titular.
  const posts = postsFor(locale);
  const guides = posts
    .map((post) => {
      const lead = post.body.split('\n\n')[0]?.replace(/\*\*/g, '') ?? post.description;
      return [
        `#### ${post.title}`,
        '',
        lead,
        '',
        url({pathname: '/blog/[slug]', params: {slug: post.slug}})
      ].join('\n');
    })
    .join('\n\n');

  return [
    `## ${locale === 'es' ? 'Español' : 'English'} — ${url('/')}`,
    '',
    `> ${meta('description')}`,
    '',
    `### ${modes('raffle.title')}`,
    '',
    modes('raffle.body'),
    '',
    `### ${modes('secretSanta.title')}`,
    '',
    modes('secretSanta.body'),
    '',
    `### ${decide('title')}`,
    '',
    decide('lede'),
    '',
    `### ${turns('title')}`,
    '',
    turns('lede'),
    '',
    `### ${teams('title')}`,
    '',
    teams('lede'),
    '',
    `### ${how('title')}`,
    '',
    steps,
    '',
    `### ${faq('title')}`,
    '',
    questions,
    '',
    ...(posts.length > 0
      ? [`### ${locale === 'es' ? 'Guías' : 'Guides'} — ${url('/blog')}`, '', guides, '']
      : []),
    `### ${locale === 'es' ? 'Enlaces' : 'Links'}`,
    '',
    `- ${modes('raffle.cta')}: ${url('/sorteo')}`,
    `- ${modes('secretSanta.cta')}: ${url('/amigo-secreto')}`,
    `- ${decide('title')}: ${url('/decidir')}`,
    `- ${turns('title')}: ${url('/turnos')}`,
    `- ${teams('title')}: ${url('/equipos')}`,
    ...(posts.length > 0 ? [`- ${locale === 'es' ? 'Guías' : 'Guides'}: ${url('/blog')}`] : []),
    `- ${locale === 'es' ? 'Privacidad' : 'Privacy'}: ${url('/privacidad')}`,
    `- ${locale === 'es' ? 'Términos' : 'Terms'}: ${url('/terminos')}`
  ].join('\n');
}

export async function GET() {
  const sections = await Promise.all(routing.locales.map(sectionFor));

  const body = [
    `# ${BRAND.name}`,
    '',
    '> Sorteos y amigo secreto con una ruleta giratoria. Gratis, sin cuenta y',
    '> en español e inglés. / Raffles and Secret Santa with a spinning wheel.',
    '> Free, no account, in Spanish and English.',
    '',
    '## Datos verificables / Verifiable facts',
    '',
    `- El ganador lo decide \`crypto.getRandomValues\` en el servidor, con rechazo de módulo; la animación se calcula después para terminar en ese segmento. / The winner comes from \`crypto.getRandomValues\` on the server with modulo rejection; the animation is computed afterwards to land there.`,
    `- El reparto del amigo secreto se guarda cifrado con AES-GCM y se borra en cuanto salen los correos. El organizador nunca lo ve. / Secret Santa assignments are stored AES-GCM encrypted and deleted once the emails are out. The organiser never sees them.`,
    `- Grupos de ${LIMITS.minSecretSanta} a ${LIMITS.max} personas en amigo secreto, de ${LIMITS.minRaffle} a ${LIMITS.max} en sorteo simple. / Groups of ${LIMITS.minSecretSanta}–${LIMITS.max} for Secret Santa, ${LIMITS.minRaffle}–${LIMITS.max} for raffles.`,
    '- Las direcciones de correo se borran a las 72 horas si el sorteo se entregó entero, y a los 10 días como máximo si algún envío falló. / Email addresses are deleted after 72 hours when the draw went out in full, and after 10 days at most when a delivery failed.',
    '- Sin cuentas, sin cookies de seguimiento, sin analítica. / No accounts, no tracking cookies, no analytics.',
    '',
    ...sections
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
