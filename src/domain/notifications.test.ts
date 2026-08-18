import { describe, expect, it } from 'vitest';
import { buildNotifications } from './notifications';
import type { Card } from './types';

const card = (overrides: Partial<Card> = {}): Card => ({
  id: 'card-1', columnId: 'todo', title: 'Revisar proposta', description: '', priority: 'medium',
  labelIds: [], assigneeIds: ['braga'], checklist: [], comments: [], createdAt: '2026-08-18T08:00:00.000Z', ...overrides,
});

describe('buildNotifications', () => {
  it('avisa atribuição, comentário e prazo próximo para o usuário atual', () => {
    const notifications = buildNotifications([
      card({ history: [
        { id: 'h1', author: 'Pallus', summary: 'alterou os responsáveis', createdAt: '2026-08-18T08:30:00.000Z' },
        { id: 'h2', author: 'Pallus', summary: 'alterou os comentários', createdAt: '2026-08-18T08:40:00.000Z' },
      ], dueDate: '2026-08-20' }),
    ], { assigneeId: 'braga', displayName: 'Braga', now: new Date('2026-08-18T09:00:00.000Z') });

    expect(notifications.map((item) => item.kind)).toEqual(expect.arrayContaining(['assignment', 'comment', 'due']));
    expect(notifications.every((item) => item.cardId === 'card-1')).toBe(true);
  });

  it('não cria aviso de atribuição ou comentário causado pelo próprio usuário', () => {
    const notifications = buildNotifications([card({ history: [
      { id: 'h1', author: 'Braga', summary: 'alterou os responsáveis', createdAt: '2026-08-18T08:30:00.000Z' },
      { id: 'h2', author: 'Braga', summary: 'alterou os comentários', createdAt: '2026-08-18T08:40:00.000Z' },
    ] })], { assigneeId: 'braga', displayName: 'Braga', now: new Date('2026-08-18T09:00:00.000Z') });

    expect(notifications.some((item) => item.kind === 'assignment' || item.kind === 'comment')).toBe(false);
  });
});
