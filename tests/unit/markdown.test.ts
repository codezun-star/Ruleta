import {describe, expect, it} from 'vitest';
import {countWords, parseBlocks, parseInline, readingMinutes} from '@/lib/markdown';

describe('parseBlocks', () => {
  it('distingue titulares de párrafos', () => {
    expect(parseBlocks('## Uno\n\nTexto suelto.\n\n### Dos')).toEqual([
      {type: 'h2', text: 'Uno'},
      {type: 'paragraph', text: 'Texto suelto.'},
      {type: 'h3', text: 'Dos'}
    ]);
  });

  it('junta las líneas de un párrafo en una sola', () => {
    expect(parseBlocks('Una frase\npartida en dos líneas.')).toEqual([
      {type: 'paragraph', text: 'Una frase partida en dos líneas.'}
    ]);
  });

  it('lee listas con guion y listas numeradas', () => {
    expect(parseBlocks('- uno\n- dos')).toEqual([{type: 'ul', items: ['uno', 'dos']}]);
    expect(parseBlocks('1. uno\n2. dos')).toEqual([{type: 'ol', items: ['uno', 'dos']}]);
  });

  it('lee citas de varias líneas', () => {
    expect(parseBlocks('> Primera\n> segunda')).toEqual([{type: 'quote', text: 'Primera segunda'}]);
  });

  it('lee tablas y descarta la línea separadora', () => {
    expect(parseBlocks('| A | B |\n| --- | --- |\n| 1 | 2 |')).toEqual([
      {type: 'table', head: ['A', 'B'], rows: [['1', '2']]}
    ]);
  });

  it('no confunde un guion a media lista con un separador', () => {
    expect(parseBlocks('---')).toEqual([{type: 'hr'}]);
  });
});

describe('parseInline', () => {
  it('reconoce negrita, cursiva, código y enlaces', () => {
    expect(parseInline('Hola **fuerte** y *suave*')).toEqual([
      {type: 'text', value: 'Hola '},
      {type: 'bold', value: 'fuerte'},
      {type: 'text', value: ' y '},
      {type: 'italic', value: 'suave'}
    ]);
    expect(parseInline('usa `código`')).toContainEqual({type: 'code', value: 'código'});
    expect(parseInline('ve a [la ruleta](/es/sorteo)')).toContainEqual({
      type: 'link',
      value: 'la ruleta',
      href: '/es/sorteo'
    });
  });

  it('deja el texto plano intacto', () => {
    expect(parseInline('sin nada especial')).toEqual([{type: 'text', value: 'sin nada especial'}]);
  });

  it('no rompe con un asterisco suelto', () => {
    expect(
      parseInline('2 * 3 = 6')
        .map((p) => p.value)
        .join('')
    ).toBe('2 * 3 = 6');
  });
});

describe('countWords', () => {
  it('no cuenta la sintaxis como palabras', () => {
    expect(countWords('## Un titular\n\n- uno\n- dos')).toBe(4);
  });

  it('cuenta el texto del enlace, no la dirección', () => {
    // "ve a la ruleta": cuatro palabras, por larga que sea la dirección.
    expect(countWords('ve a [la ruleta](/es/sorteo/muy/larga)')).toBe(4);
    expect(countWords('ve a [la ruleta](/es/blog/como-hacer-un-sorteo)')).toBe(4);
  });

  it('el tiempo de lectura nunca baja de un minuto', () => {
    expect(readingMinutes('dos palabras')).toBe(1);
    expect(readingMinutes(Array.from({length: 1200}, () => 'palabra').join(' '))).toBe(6);
  });
});
