import type {ReactNode} from 'react';

/**
 * Renderizador de un subconjunto de Markdown: exactamente lo que usan los
 * artículos y nada más. Se escribió a mano en lugar de traer una librería
 * porque el contenido es nuestro —no hay riesgo de inyección— y así cada
 * bloque sale con las clases del sistema de diseño en vez de un `prose`
 * genérico.
 *
 * Admite: ## y ###, párrafos, listas con - y con 1., citas con >, tablas,
 * separadores ---, y en línea **negrita**, *cursiva*, `código` y [enlaces](url).
 */

type Inline =
  | {type: 'text' | 'bold' | 'italic' | 'code'; value: string}
  | {type: 'link'; value: string; href: string};

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];

  for (const chunk of text.split(INLINE)) {
    if (chunk === '') continue;

    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      parts.push({type: 'bold', value: chunk.slice(2, -2)});
    } else if (chunk.startsWith('`') && chunk.endsWith('`')) {
      parts.push({type: 'code', value: chunk.slice(1, -1)});
    } else if (chunk.startsWith('[')) {
      const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(chunk);
      if (match) parts.push({type: 'link', value: match[1] as string, href: match[2] as string});
      else parts.push({type: 'text', value: chunk});
    } else if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      parts.push({type: 'italic', value: chunk.slice(1, -1)});
    } else {
      parts.push({type: 'text', value: chunk});
    }
  }

  return parts;
}

function Inlines({text}: {text: string}) {
  return (
    <>
      {parseInline(text).map((part, index) => {
        if (part.type === 'bold') return <strong key={index}>{part.value}</strong>;
        if (part.type === 'italic') return <em key={index}>{part.value}</em>;
        if (part.type === 'code') {
          return (
            <code key={index} className="bg-paper-2 px-1.5 py-0.5 font-mono text-[0.9em]">
              {part.value}
            </code>
          );
        }
        if (part.type === 'link') {
          const external = part.href.startsWith('http');
          return (
            <a
              key={index}
              href={part.href}
              className="font-medium text-vermilion-2 underline underline-offset-4"
              {...(external ? {rel: 'noopener', target: '_blank'} : {})}
            >
              {part.value}
            </a>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
}

export type Block =
  | {type: 'h2' | 'h3' | 'paragraph' | 'quote'; text: string}
  | {type: 'ul' | 'ol'; items: string[]}
  | {type: 'table'; head: string[]; rows: string[][]}
  | {type: 'hr'};

export function parseBlocks(markdown: string): Block[] {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((raw): Block => {
      const lines = raw.split('\n').map((line) => line.trim());
      const first = lines[0] ?? '';

      if (first === '---') return {type: 'hr'};
      if (first.startsWith('### ')) return {type: 'h3', text: first.slice(4)};
      if (first.startsWith('## ')) return {type: 'h2', text: first.slice(3)};
      if (first.startsWith('> ')) {
        return {type: 'quote', text: lines.map((line) => line.replace(/^>\s?/, '')).join(' ')};
      }
      if (lines.every((line) => line.startsWith('- '))) {
        return {type: 'ul', items: lines.map((line) => line.slice(2))};
      }
      if (lines.every((line) => /^\d+\.\s/.test(line))) {
        return {type: 'ol', items: lines.map((line) => line.replace(/^\d+\.\s/, ''))};
      }
      if (first.startsWith('|')) {
        const cells = (line: string) =>
          line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
        // La segunda línea es el separador de la cabecera; se descarta.
        return {type: 'table', head: cells(first), rows: lines.slice(2).map(cells)};
      }

      return {type: 'paragraph', text: lines.join(' ')};
    });
}

/** Palabras del cuerpo, sin la sintaxis de Markdown. Da el tiempo de lectura. */
export function countWords(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    // Los enlaces primero: si se quitan los guiones antes, una dirección con
    // guiones deja de parecerse a un enlace y se cuela entera en la cuenta.
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>|*`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain === '' ? 0 : plain.split(' ').length;
}

/**
 * Parte el texto justo antes de su enésimo `##`, para poder meter algo entre
 * medias. Devuelve el texto entero y una cadena vacía si no hay tantas
 * secciones: un artículo corto se queda de una pieza en vez de partirse por
 * un sitio raro.
 */
export function splitAtHeading(markdown: string, nth: number): [string, string] {
  const blocks = markdown.split(/\n{2,}/);
  let seen = 0;

  for (const [index, block] of blocks.entries()) {
    if (!block.startsWith('## ')) continue;
    seen += 1;
    if (seen < nth) continue;
    return [blocks.slice(0, index).join('\n\n'), blocks.slice(index).join('\n\n')];
  }

  return [markdown, ''];
}

export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / 200));
}

export function Markdown({content}: {content: string}): ReactNode {
  return (
    <>
      {parseBlocks(content).map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={index}
                className="mt-10 font-head text-2xl font-black text-balance sm:text-3xl"
              >
                <Inlines text={block.text} />
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="mt-7 font-head text-xl font-black text-balance">
                <Inlines text={block.text} />
              </h3>
            );
          case 'quote':
            return (
              <blockquote
                key={index}
                className="mt-5 border-l-4 border-vermilion bg-paper-2 px-5 py-4 text-ink-2"
              >
                <Inlines text={block.text} />
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={index} className="mt-4 flex flex-col gap-2">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-2">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-vermilion" />
                    <span>
                      <Inlines text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={index} className="mt-4 flex flex-col gap-2.5">
                {block.items.map((item, position) => (
                  <li key={item} className="flex gap-3 text-ink-2">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink font-head text-xs font-black text-ink"
                    >
                      {position + 1}
                    </span>
                    <span>
                      <Inlines text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case 'table':
            return (
              <div key={index} className="mt-5 overflow-x-auto border-2 border-ink">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <thead>
                    <tr>
                      {block.head.map((cell) => (
                        <th
                          key={cell}
                          scope="col"
                          className="border-b border-hairline bg-paper-2 px-4 py-2.5 text-left text-[0.68rem] font-bold tracking-[0.14em] text-ink-2 uppercase"
                        >
                          <Inlines text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b border-hairline px-4 py-2.5 last:border-b-0"
                          >
                            <Inlines text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'hr':
            return <hr key={index} className="mt-10 border-t-2 border-ink" />;
          default:
            return (
              <p key={index} className="mt-4 text-lg leading-relaxed text-ink-2">
                <Inlines text={block.text} />
              </p>
            );
        }
      })}
    </>
  );
}
