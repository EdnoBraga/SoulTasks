import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BoardNavigation from './BoardNavigation';

describe('BoardNavigation', () => {
  it('ajusta o zoom pelo controle deslizante inferior', () => {
    render(<BoardNavigation />);
    const slider = screen.getByRole('slider', { name: /ajustar zoom/i });
    fireEvent.change(slider, { target: { value: '88' } });
    expect(screen.getByText('88%')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /zoom 80/i })).toBeNull();
  });

  it('publica filtros rápidos de responsável, etiqueta, prazo e prioridade', () => {
    const events: CustomEvent[] = [];
    const listener = (event: Event) => events.push(event as CustomEvent);
    window.addEventListener('soultasks:quick-filters', listener);
    render(<BoardNavigation />);
    fireEvent.change(screen.getByRole('combobox', { name: /responsável/i }), { target: { value: 'braga' } });
    fireEvent.change(screen.getByRole('combobox', { name: /etiqueta/i }), { target: { value: 'site' } });
    fireEvent.change(screen.getByRole('combobox', { name: /prazo/i }), { target: { value: 'overdue' } });
    fireEvent.change(screen.getByRole('combobox', { name: /prioridade/i }), { target: { value: 'high' } });
    expect(events.at(-1)?.detail).toMatchObject({ assigneeId: 'braga', labelId: 'site', due: 'overdue', priority: 'high' });
    window.removeEventListener('soultasks:quick-filters', listener);
  });

  it('oferece filtros salvos para o trabalho diário', () => {
    const events: CustomEvent[] = [];
    const listener = (event: Event) => events.push(event as CustomEvent);
    window.addEventListener('soultasks:quick-filters', listener);
    render(<BoardNavigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Minhas tarefas' }));
    expect(events.at(-1)?.detail).toMatchObject({ assigneeId: 'braga', due: 'all' });
    fireEvent.click(screen.getByRole('button', { name: 'Atrasadas' }));
    expect(events.at(-1)?.detail).toMatchObject({ assigneeId: 'all', due: 'overdue' });
    fireEvent.click(screen.getByRole('button', { name: 'Esta semana' }));
    expect(events.at(-1)?.detail).toMatchObject({ assigneeId: 'all', due: 'week' });
    window.removeEventListener('soultasks:quick-filters', listener);
  });
});
