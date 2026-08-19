import { describe, expect, it } from 'vitest';
import { removeAssigneeFromState } from './assigneeCleanup';
import type { BoardState } from './types';

const state: BoardState = {
  activeBoardId: 'main',
  labels: [],
  inbox: [{ id: 'inbox-1', title: 'Ideia', description: '', createdAt: '2026-08-18', quickCommands: { assigneeIds: ['pallus', 'braga'] } }],
  cardTemplates: [{ id: 'template-1', name: 'Modelo', description: '', priority: 'medium', labelIds: [], assigneeIds: ['pallus'], checklist: [{ id: 'check-1', text: 'Revisar', done: false, assigneeId: 'pallus' }], recurrence: 'none' }],
  boards: {
    main: {
      id: 'main', name: 'Geral', description: '', columnIds: ['todo'],
      columns: { todo: { id: 'todo', name: 'A fazer', color: '#000', icon: '·', description: '', complete: false } },
      cards: {
        card: { id: 'card', columnId: 'todo', title: 'Tarefa', description: '', priority: 'medium', labelIds: [], assigneeIds: ['pallus', 'braga'], checklist: [{ id: 'check', text: 'Subtarefa', done: false, assigneeId: 'pallus' }], comments: [], createdAt: '2026-08-18' },
      },
    },
  },
};

describe('removeAssigneeFromState', () => {
  it('remove o participante excluído de cards, subtarefas, modelos e Inbox', () => {
    const result = removeAssigneeFromState(state, 'pallus');

    expect(result.boards.main?.cards.card?.assigneeIds).toEqual(['braga']);
    expect(result.boards.main?.cards.card?.checklist[0]?.assigneeId).toBeUndefined();
    expect(result.cardTemplates?.[0]?.assigneeIds).toEqual([]);
    expect(result.cardTemplates?.[0]?.checklist[0]?.assigneeId).toBeUndefined();
    expect(result.inbox[0]?.quickCommands?.assigneeIds).toEqual(['braga']);
  });
});
