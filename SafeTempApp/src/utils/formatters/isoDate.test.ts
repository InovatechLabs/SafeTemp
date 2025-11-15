import { formatHour } from './isoDate';

describe('formatHour', () => {
  it('deve formatar a hora e adicionar 3 horas (corrigindo fuso UTC)', () => {
    const isoDate = '2024-01-01T10:30:00.000Z';
    expect(formatHour(isoDate)).toBe('13:30');
  });

  it('deve formatar corretamente a hora na transição de dia', () => {
    const isoDate = '2024-01-01T23:59:00.000Z';
    expect(formatHour(isoDate)).toBe('02:59');
  });

  it('deve adicionar um zero à esquerda para horas e minutos menores que 10', () => {

    const isoDate = '2024-01-01T04:05:00.000Z';
    expect(formatHour(isoDate)).toBe('07:05');
  });
});