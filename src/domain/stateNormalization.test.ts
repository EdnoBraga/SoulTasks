import { describe, expect, it } from 'vitest';
import { normalizeBoardState } from './stateNormalization';
import type { BoardState } from './types';

describe('normalizeBoardState', () => {
  it('fills fields introduced after older cards were saved remotely', () => {
    const legacy = {
      boards: {
        main: {
          id: 'main', name: 'Geral', description: '', columnIds: ['todo'],
          columns: { todo: { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false } },
          cards: { legacy: { id: 'legacy', columnId: 'todo', title: 'Card antigo', priority: 'medium', createdAt: '2026-08-18T00:00:00Z' } },
        },
      },
      activeBoardId: 'main', inbox: [], labels: [],
    } as unknown as BoardState;

    const normalized = normalizeBoardState(legacy);
    const card = normalized.boards.main!.cards.legacy!;

    expect(card.description).toBe('');
    expect(card.labelIds).toEqual([]);
    expect(card.assigneeIds).toEqual([]);
    expect(card.checklist).toEqual([]);
    expect(card.comments).toEqual([]);
    expect(card.attachments).toEqual([]);
    expect(card.history).toEqual([]);
  });
});
