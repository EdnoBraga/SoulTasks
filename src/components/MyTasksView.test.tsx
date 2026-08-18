import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MyTasksView from './MyTasksView';
import type { Board } from '../domain/types';

const board: Board = { id: 'site', name: 'Site', description: '', columnIds: ['todo'], columns: { todo: { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false } }, cards: { c1: { id: 'c1', columnId: 'todo', title: 'Revisar homepage', description: '', priority: 'high', labelIds: [], assigneeIds: ['braga'], checklist: [], comments: [], createdAt: '2026-08-18' }, c2: { id: 'c2', columnId: 'todo', title: 'Outra pessoa', description: '', priority: 'low', labelIds: [], assigneeIds: ['pallus'], checklist: [], comments: [], createdAt: '2026-08-18' } } };

describe('MyTasksView', () => {
  it('consolida somente os cards atribuídos ao usuário atual', () => {
    const onOpenCard = vi.fn();
    render(<MyTasksView boards={[board]} assigneeId="braga" onOpenCard={onOpenCard} />);
    expect(screen.getByText('Revisar homepage')).toBeTruthy();
    expect(screen.queryByText('Outra pessoa')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /revisar homepage/i }));
    expect(onOpenCard).toHaveBeenCalledWith(board.cards.c1, board);
  });
});
