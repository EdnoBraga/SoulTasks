import { describe, expect, it } from 'vitest';
import { getCardAttention } from './cardAttention';
import type { Card } from './types';

const card = (overrides: Partial<Card> = {}): Card => ({ id: 'card-1', columnId: 'todo', title: 'Tarefa', description: '', priority: 'medium', labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: '2026-08-18T08:00:00.000Z', ...overrides });

describe('getCardAttention', () => {
  it('identifica atraso e ausência de responsável', () => {
    expect(getCardAttention(card({ dueDate: '2026-08-17' }), false, new Date('2026-08-18T09:00:00.000Z'))).toEqual({ overdue: true, unassigned: true });
  });

  it('não marca card concluído como atrasado', () => {
    expect(getCardAttention(card({ dueDate: '2026-08-17', assigneeIds: ['braga'] }), true, new Date('2026-08-18T09:00:00.000Z'))).toEqual({ overdue: false, unassigned: false });
  });
});
