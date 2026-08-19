import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CardModal from './CardModal';
import type { Card } from '../domain/types';
import { SOULFORK_ASSIGNEES } from '../domain/assignees';

const card: Card = { id: 'card-1', columnId: 'todo', title: 'Planejar conteúdo', description: '', priority: 'medium', labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: '2026-08-18' };

describe('CardModal', () => {
  it('permite criar uma subtarefa e atribuí-la a um integrante', () => {
    const onSave = vi.fn();
    render(<CardModal card={card} columns={[{ id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false }]} labels={[]} templates={[]} onApplyTemplate={vi.fn()} onSaveTemplate={vi.fn()} onClose={vi.fn()} onSave={onSave} onDelete={vi.fn()} onDuplicate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar subtarefa' }));
    fireEvent.change(screen.getByPlaceholderText('Descrever subtarefa...'), { target: { value: 'Revisar briefing' } });
    fireEvent.change(screen.getByLabelText('Responsável pela subtarefa'), { target: { value: 'pallus' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Revisar briefing')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar card' }));
    expect(onSave.mock.calls[0]?.[0]?.checklist[0]).toMatchObject({ text: 'Revisar briefing', assigneeId: 'pallus', done: false });
  });

  it('exibe somente os integrantes ativos ao criar um card', () => {
    render(<CardModal card={card} assignees={[SOULFORK_ASSIGNEES[0]]} columns={[{ id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false }]} labels={[]} templates={[]} onApplyTemplate={vi.fn()} onSaveTemplate={vi.fn()} onClose={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Braga/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Pallus/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Kayo/ })).toBeNull();
  });
});
