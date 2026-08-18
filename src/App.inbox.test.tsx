import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InboxPanel } from './App';

describe('InboxPanel', () => {
  it('oculta e expande a captura rápida sem perder a tarefa capturada', () => {
    render(<InboxPanel items={[{ id: '1', title: 'Ideia importante', description: '' }]} onCapture={() => undefined} onConfigure={() => undefined} onPromote={() => undefined} />);
    expect(screen.getByText('Ideia importante')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /ocultar captura rápida/i }));
    expect(screen.getByRole('button', { name: /expandir captura rápida/i })).toBeTruthy();
    expect(screen.queryByText('Ideia importante')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /expandir captura rápida/i }));
    expect(screen.getByText('Ideia importante')).toBeTruthy();
  });
});
