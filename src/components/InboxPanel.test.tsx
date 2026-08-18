import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import InboxPanel from './InboxPanel';

describe('InboxPanel', () => {
  it('edita e exclui ideias sem promovê-las ao quadro', () => {
    const onUpdate = vi.fn(); const onDelete = vi.fn();
    render(<InboxPanel items={[{ id: 'i1', title: 'Ideia antiga', description: '' }]} onCapture={vi.fn()} onConfigure={vi.fn()} onPromote={vi.fn()} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /editar ideia ideia antiga/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /editar ideia/i }), { target: { value: 'Ideia revisada' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Ideia revisada' }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: /excluir ideia ideia antiga/i }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }));
  });
});
