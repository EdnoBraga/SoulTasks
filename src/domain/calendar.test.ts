import { describe, expect, it } from 'vitest';
import { addDays, getMonthDays, getWeekStart, toDateKey } from './calendar';

describe('calendar helpers', () => {
  it('calcula a segunda-feira da semana e as datas seguintes', () => {
    const monday = getWeekStart(new Date('2026-08-19T12:00:00.000Z'));
    expect(toDateKey(monday)).toBe('2026-08-17');
    expect(toDateKey(addDays(monday, 6))).toBe('2026-08-23');
  });

  it('gera uma grade mensal completa iniciada na segunda-feira', () => {
    const days = getMonthDays(new Date('2026-08-19T12:00:00.000Z'));
    expect(days).toHaveLength(42);
    expect(days[0]?.getDay()).toBe(1);
    expect(toDateKey(days[21]!)).toBe('2026-08-17');
  });
});
