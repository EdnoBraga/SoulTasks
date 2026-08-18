import { describe, expect, it } from 'vitest';
import { buildActivityGroups } from './activity';
import type { Board, BoardState } from './types';

const board = (id: string, title: string): Board => ({ id, name: id === 'site' ? 'Site' : 'Design', description: '', columnIds: ['todo'], columns: { todo: { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false } }, cards: { [id]: { id, columnId: 'todo', title, description: '', priority: 'medium', labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: '2026-08-18' } } });

describe('activity groups', () => {
  it('separates events by workflow and keeps inbox in the general group', () => {
    const state: BoardState = { boards: {}, activeBoardId: 'site', labels: [], inbox: [{ id: 'i1', title: 'Ideia', description: '', createdAt: '2026-08-19' }] };
    const groups = buildActivityGroups(state, [board('site', 'Página'), board('design', 'Banner')]);
    expect(groups.map((group) => group.name)).toEqual(['Geral / Inbox', 'Site', 'Design']);
    expect(groups.find((group) => group.id === 'site')?.items[0]?.title).toBe('Página');
  });
});
