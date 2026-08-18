import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NotificationCenter from './NotificationCenter';

describe('NotificationCenter', () => {
  it('abre avisos e permite abrir o card relacionado', () => {
    const onOpenCard = vi.fn();
    render(<NotificationCenter open notifications={[{ id: 'n1', kind: 'due', title: 'Prazo próximo', message: 'Vence amanhã.', createdAt: '2026-08-18', cardId: 'card-1' }]} onToggle={vi.fn()} onClose={vi.fn()} onOpenCard={onOpenCard} />);
    expect(screen.getByRole('dialog', { name: 'Notificações' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /prazo próximo/i }));
    expect(onOpenCard).toHaveBeenCalledWith('card-1');
  });
});
