import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CardModalWithMentions from './CardModalWithMentions';
import type { Card } from '../domain/types';

const card: Card = { id: 'card-1', columnId: 'todo', title: 'Tarefa', description: '', priority: 'medium', labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: '2026-08-18' };

describe('CardModalWithMentions', () => {
  it('sugere Pallus e salva o comentário com a menção', () => {
    const onSave = vi.fn();
    render(<CardModalWithMentions card={card} columns={[{ id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false }]} labels={[]} templates={[]} onApplyTemplate={vi.fn()} onSaveTemplate={vi.fn()} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Novo comentário com menção'), { target: { value: '@pa' } });
    fireEvent.click(screen.getByRole('button', { name: /@Pallus/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar comentário' }));
    expect(onSave.mock.calls[0]?.[0]?.comments).toEqual(['@Pallus']);
  });
});
