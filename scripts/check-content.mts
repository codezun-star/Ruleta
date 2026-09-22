/**
 * Revisa los artículos antes de publicarlos. No comprueba el estilo —eso no se
 * automatiza— sino las cosas que rompen el SEO en silencio: una meta que Google
 * recorta, un slug repetido que hace que dos artículos se canibalicen, un
 * relacionado que apunta a un artículo que no existe.
 *
 *     npm run check:content
 */
import {POSTS} from '../src/content/posts';
import {countWords, parseBlocks} from '../src/lib/markdown';

/**
 * Una franja, no un número: por debajo de 700 palabras un artículo de cola
 * larga no cubre el tema y por encima de 1600 se lee a saltos. Los nuestros
 * apuntan a unas 1000.
 */
const WORDS = {min: 700, max: 1600};
/** Google recorta la meta description alrededor de los 160 caracteres. */
const DESCRIPTION = {min: 120, max: 160};
/** El título de pestaña se recorta antes. */
const SEO_TITLE_MAX = 60;

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Palabras con contenido de la clave: fuera preposiciones y artículos. */
const STOPWORDS = new Set([
  'al',
  'con',
  'como',
  'cuando',
  'cual',
  'del',
  'donde',
  'los',
  'las',
  'para',
  'por',
  'que',
  'sin',
  'son',
  'una',
  'uno'
]);

function keywordTerms(keyword: string): string[] {
  return normalize(keyword)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

const problems: string[] = [];
const rows: {
  slug: string;
  words: number;
  minutes: number;
  desc: number;
  title: number;
  faq: number;
}[] = [];
const seen = new Set<string>();

for (const post of POSTS) {
  const id = post.locale + '/' + post.slug;
  const fail = (message: string) => problems.push(id + ': ' + message);

  if (seen.has(id)) fail('slug repetido en este idioma');
  seen.add(id);

  const words = countWords(post.body);
  if (words < WORDS.min) fail(words + ' palabras, por debajo de ' + WORDS.min);
  if (words > WORDS.max) fail(words + ' palabras, por encima de ' + WORDS.max);

  if (post.description.length < DESCRIPTION.min || post.description.length > DESCRIPTION.max) {
    fail(
      'meta description de ' +
        post.description.length +
        ' caracteres (quiere ' +
        DESCRIPTION.min +
        '-' +
        DESCRIPTION.max +
        ')'
    );
  }
  if (post.seoTitle.length > SEO_TITLE_MAX) {
    fail('seoTitle de ' + post.seoTitle.length + ' caracteres (máx. ' + SEO_TITLE_MAX + ')');
  }

  // El artículo tiene que hablar de su palabra clave. Se comprueban las
  // palabras con contenido, no la frase literal: exigir la frase exacta obliga
  // a escribir "cómo armar equipos al azar" donde el castellano pide "para
  // armar equipos al azar", que es justo el relleno que Google penaliza.
  const missing = keywordTerms(post.keyword).filter((term) => !normalize(post.body).includes(term));
  if (missing.length > 0) {
    fail('el cuerpo no menciona ' + missing.join(', ') + ' (de "' + post.keyword + '")');
  }

  // La frase entera sí tiene que estar donde Google la lee como declaración
  // de intención.
  const surfaces = normalize(post.title + ' ' + post.seoTitle + ' ' + post.description);
  if (!surfaces.includes(normalize(post.keyword))) {
    fail('"' + post.keyword + '" no aparece entera en el título ni en la meta');
  }

  // El bloque de preguntas es lo que se emite como FAQPage. Una sola pregunta
  // no da para un rich result y una respuesta de dos líneas tampoco se cita.
  if (post.faq.length < 2) fail('necesita al menos dos preguntas para el FAQPage');
  for (const item of post.faq) {
    if (!item.q.trim().endsWith('?'))
      fail('la pregunta "' + item.q + '" no acaba en interrogación');
    if (item.a.length < 150)
      fail(
        'la respuesta a "' +
          item.q +
          '" son ' +
          item.a.length +
          ' caracteres, muy corta para un extracto'
      );
    if (item.a.length > 600)
      fail(
        'la respuesta a "' + item.q + '" son ' + item.a.length + ' caracteres, Google la recorta'
      );
  }
  const questions = new Set(post.faq.map((item) => normalize(item.q)));
  if (questions.size !== post.faq.length) fail('preguntas repetidas en el FAQPage');

  const blocks = parseBlocks(post.body);
  if (blocks[0]?.type !== 'paragraph') fail('no abre con un párrafo de respuesta');
  if (!blocks.some((block) => block.type === 'h2'))
    fail('no tiene ningún ## que estructure el texto');

  for (const slug of post.related) {
    if (!POSTS.some((other) => other.locale === post.locale && other.slug === slug)) {
      fail('relacionado inexistente: ' + slug);
    }
  }
  if (post.related.includes(post.slug)) fail('se relaciona consigo mismo');

  rows.push({
    slug: post.slug,
    words,
    minutes: Math.max(1, Math.round(words / 200)),
    desc: post.description.length,
    title: post.seoTitle.length,
    faq: post.faq.length
  });
}

const pad = (value: string | number, width: number) => String(value).padEnd(width);
console.log(
  pad('artículo', 42) +
    pad('palabras', 10) +
    pad('min', 5) +
    pad('meta', 6) +
    pad('título', 8) +
    'faq'
);
for (const row of rows) {
  console.log(
    pad(row.slug, 42) +
      pad(row.words, 10) +
      pad(row.minutes, 5) +
      pad(row.desc, 6) +
      pad(row.title, 8) +
      row.faq
  );
}

const total = rows.reduce((sum, row) => sum + row.words, 0);
console.log(
  '\n' +
    rows.length +
    ' artículos, ' +
    total +
    ' palabras, media ' +
    Math.round(total / rows.length) +
    '.'
);

if (problems.length > 0) {
  console.error('\n' + problems.length + ' problema(s):');
  for (const problem of problems) console.error('  - ' + problem);
  process.exit(1);
}
console.log('Sin problemas.');
