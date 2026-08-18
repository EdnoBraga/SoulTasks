import { describe, expect, it } from 'vitest';
import { parseQuickCapture } from './quickCapture';

describe('parseQuickCapture', () => {
  it('converte comandos de captura em metadados do card', () => {
    const result = parseQuickCapture('/site /Braga /alta /sexta Revisar a página inicial', new Date('2026-08-18T09:00:00.000Z'));
    expect(result.title).toBe('Revisar a página inicial');
    expect(result.commands).toEqual({ labelIds: ['site'], assigneeIds: ['braga'], priority: 'high', dueDate: '2026-08-21' });
  });

  it('mantém comandos desconhecidos para não apagar conteúdo do usuário', () => {
    expect(parseQuickCapture('/urgente Planejar campanha', new Date('2026-08-18T09:00:00.000Z'))).toEqual({ title: '/urgente Planejar campanha', commands: {} });
  });
});
