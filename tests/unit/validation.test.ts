import {describe, expect, it} from 'vitest';
import {parsePastedParticipants, validateParticipants} from '@/lib/validation/participants';
import {LIMITS} from '@/lib/validation/limits';

const person = (id: string, name: string, email = '') => ({id, name, email});
const keys = (issues: {key: string}[]) => issues.map((issue) => issue.key);

describe('parsePastedParticipants', () => {
  it('entiende las cuatro formas de pegar una línea', () => {
    const parsed = parsePastedParticipants(
      [
        'Ana Robles, ana@ejemplo.com',
        'Kenji Morales <kenji@ejemplo.com>',
        'Marisol Cadena; marisol@ejemplo.com',
        'Diego Restrepo'
      ].join('\n')
    );

    expect(parsed).toEqual([
      {name: 'Ana Robles', email: 'ana@ejemplo.com'},
      {name: 'Kenji Morales', email: 'kenji@ejemplo.com'},
      {name: 'Marisol Cadena', email: 'marisol@ejemplo.com'},
      {name: 'Diego Restrepo', email: ''}
    ]);
  });

  it('se salta líneas en blanco y espacios sobrantes', () => {
    expect(parsePastedParticipants('\n  Ana  \n\n\n  Kenji \n')).toEqual([
      {name: 'Ana', email: ''},
      {name: 'Kenji', email: ''}
    ]);
  });

  it('con un correo suelto lo usa también de nombre', () => {
    expect(parsePastedParticipants('sola@ejemplo.com')).toEqual([
      {name: 'sola@ejemplo.com', email: 'sola@ejemplo.com'}
    ]);
  });

  it('acepta tabuladores, que es lo que sale al pegar de una hoja de cálculo', () => {
    expect(parsePastedParticipants('Ana\tana@ejemplo.com')).toEqual([
      {name: 'Ana', email: 'ana@ejemplo.com'}
    ]);
  });
});

describe('validateParticipants', () => {
  const options = {min: 2, requireEmail: false};

  it('acepta una lista correcta', () => {
    const issues = validateParticipants(
      [person('1', 'Ana', 'ana@ejemplo.com'), person('2', 'Kenji', 'kenji@ejemplo.com')],
      options
    );
    expect(issues).toEqual([]);
  });

  it('pide el nombre de cada fila', () => {
    const issues = validateParticipants([person('1', ''), person('2', 'Kenji')], options);
    expect(keys(issues)).toContain('nameRequired');
  });

  it('marca el correo mal escrito', () => {
    const issues = validateParticipants(
      [person('1', 'Ana', 'ana@'), person('2', 'Kenji', 'kenji@ejemplo.com')],
      options
    );
    expect(keys(issues)).toContain('emailInvalid');
  });

  it('marca el duplicado en la fila repetida, no en la primera', () => {
    const issues = validateParticipants(
      [person('1', 'Ana', 'ana@ejemplo.com'), person('2', 'Kenji', 'ana@ejemplo.com')],
      options
    );
    const duplicate = issues.find((issue) => issue.key === 'duplicateEmail');
    expect(duplicate?.index).toBe(1);
  });

  it('detecta nombres repetidos aunque cambie la caja', () => {
    const issues = validateParticipants([person('1', 'Ana'), person('2', 'ANA')], options);
    expect(keys(issues)).toContain('duplicateName');
  });

  it('en el amigo secreto el correo es obligatorio', () => {
    const issues = validateParticipants(
      [person('1', 'Ana'), person('2', 'Kenji'), person('3', 'Marisol')],
      {min: 3, requireEmail: true}
    );
    expect(keys(issues).filter((key) => key === 'emailRequired')).toHaveLength(3);
  });

  it('exige el mínimo contando solo a quien tiene nombre', () => {
    const issues = validateParticipants([person('1', 'Ana'), person('2', '')], options);
    const tooFew = issues.find((issue) => issue.key === 'tooFewParticipants');
    expect(tooFew?.params).toEqual({min: 2});
  });

  it('corta en el máximo', () => {
    const many = Array.from({length: LIMITS.max + 1}, (_, i) =>
      person(String(i), `Persona ${i}`, `p${i}@ejemplo.com`)
    );
    expect(keys(validateParticipants(many, options))).toContain('tooManyParticipants');
  });
});
