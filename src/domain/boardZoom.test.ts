import { describe, expect, it } from 'vitest';
import { normalizeBoardZoom } from './boardZoom';

describe('normalizeBoardZoom', () => {
  it('aceita valores contínuos dentro do intervalo do controle', () => {
    expect(normalizeBoardZoom('80')).toBe(80);
    expect(normalizeBoardZoom('87')).toBe(87);
    expect(normalizeBoardZoom('100')).toBe(100);
  });

  it('volta para 100% quando a preferência é inválida', () => {
    expect(normalizeBoardZoom('125')).toBe(100);
    expect(normalizeBoardZoom('50')).toBe(80);
    expect(normalizeBoardZoom(null)).toBe(100);
  });
});
