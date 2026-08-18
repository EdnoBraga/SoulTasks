import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardOverview from './DashboardOverview';
import type { Board } from '../domain/types';

const board: Board = { id: 'site', name: 'Site', description: '', columnIds: ['todo', 'done'], columns: { todo: { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false }, done: { id: 'done', name: 'Concluído', color: '#8FD41F', icon: '✓', description: '', complete: true } }, cards: { c1: { id: 'c1', columnId: 'todo', title: 'Página', description: '', priority: 'high', labelIds: [], assigneeIds: ['braga'], checklist: [], comments: [], createdAt: '2026-08-18', dueDate: '2026-08-17' }, c2: { id: 'c2', columnId: 'done', title: 'Rodapé', description: '', priority: 'low', labelIds: [], assigneeIds: ['pallus'], checklist: [], comments: [], createdAt: '2026-08-18' } } };

describe('DashboardOverview', () => {
  it('exibe carga por pessoa, atrasos e progresso do departamento', () => {
    render(<DashboardOverview boards={[board]} />);
    expect(screen.getByText('Carga da equipe')).toBeTruthy();
    expect(screen.getByText('Braga')).toBeTruthy();
    expect(screen.getAllByText('1 tarefa')).toHaveLength(2);
    expect(screen.getByText('Site')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('atrasada')).toBeTruthy();
  });
});
