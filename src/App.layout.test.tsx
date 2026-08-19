import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./storage/supabaseStateAdapter', async () => {
  const actual = await vi.importActual<typeof import('./storage/supabaseStateAdapter')>('./storage/supabaseStateAdapter');
  return { ...actual, getSupabaseConfig: () => null };
});

describe('layout do workspace', () => {
  it('mantém modelos e quadro dentro da coluna principal', () => {
    const { container } = render(<App />);
    const boardArea = container.querySelector('.board-area');
    const templatePanel = container.querySelector('.template-panel');

    expect(boardArea).toBeTruthy();
    expect(boardArea?.contains(templatePanel)).toBe(true);
  });

  it('expande as visões pessoais para toda a área principal', () => {
    const { container } = render(<App />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Navegação principal' })).getByRole('button', { name: 'Minhas tarefas' }));
    expect(container.querySelector('.board-area.full-view-area')).toBeTruthy();
    expect(container.querySelector('.full-view-area > .my-tasks-view')).toBeTruthy();
  });
});
