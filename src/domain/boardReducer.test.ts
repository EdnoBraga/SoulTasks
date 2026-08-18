import { describe, expect, it } from 'vitest';
import { boardReducer } from './boardReducer';
import { createDemoState } from './demoData';

describe('boardReducer', () => {
  it('cria e move um card entre colunas sem perder os cards existentes', () => {
    const initial = createDemoState();
    const card = { id: 'test-card', columnId: 'todo', title: 'Teste', description: '', priority: 'medium' as const, labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: new Date().toISOString() };
    const created = boardReducer(initial, { type: 'createCard', card });
    const moved = boardReducer(created, { type: 'moveCard', cardId: card.id, columnId: 'doing' });
    expect(moved.boards.main!.cards[card.id]!.columnId).toBe('doing');
    expect(moved.boards.main!.cards['card-1']!.title).toContain('conteúdos');
  });

  it('personaliza uma coluna e captura uma ideia na Inbox', () => {
    const initial = createDemoState();
    const updated = boardReducer(initial, { type: 'updateColumn', column: { ...initial.boards.main!.columns.todo!, name: 'Próximos passos' } });
    const captured = boardReducer(updated, { type: 'captureInbox', item: { id: 'new', title: 'Nova ideia', description: '', createdAt: new Date().toISOString() } });
    expect(captured.boards.main!.columns.todo!.name).toBe('Próximos passos');
    expect(captured.inbox[0]!.title).toBe('Nova ideia');
  });

  it('registra autor e horário ao mover um card', () => {
    const initial = createDemoState();
    const moved = boardReducer(initial, { type: 'moveCard', cardId: 'card-1', columnId: 'doing', actor: 'Braga' });
    expect(moved.boards.main!.cards['card-1']!.history?.[0]).toMatchObject({ author: 'Braga', summary: 'moveu o card de coluna' });
    expect(moved.boards.main!.cards['card-1']!.history?.[0]?.createdAt).toBeTruthy();
  });
});
