import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ExportMenu from './ExportMenu';
import type { Board } from '../domain/types';

const board = { id: 'main', name: 'Geral', description: '', columnIds: [], columns: {}, cards: {} } as Board;

describe('ExportMenu', () => {
  it('offers CSV and printable PDF actions for the selected workflows', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(<ExportMenu boards={[board]} onExportCsv={click} onExportPdf={click} />);
    await user.click(screen.getByRole('button', { name: 'Exportar' }));
    expect(screen.getByRole('menuitem', { name: 'Baixar CSV' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Imprimir / PDF' })).toBeTruthy();
  });
});
