import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BoardZoomControl from './BoardZoomControl';

describe('BoardZoomControl', () => {
  it('mantém o controle de zoom dentro do canvas e ajusta as colunas', () => {
    const canvas = document.createElement('div');
    canvas.className = 'board-canvas';
    const columns = document.createElement('div');
    columns.className = 'columns-row';
    canvas.append(columns);
    const mount = document.createElement('div');
    canvas.append(mount);
    document.body.append(canvas);

    render(<BoardZoomControl canvasRef={{ current: canvas }} />, { container: mount });
    const slider = screen.getByRole('slider', { name: /ajustar zoom/i });
    fireEvent.change(slider, { target: { value: '88' } });

    expect(canvas.contains(screen.getByText('88%'))).toBe(true);
    expect(columns.style.zoom).toBe('0.88');
    expect(screen.getByText(/shift \+ rolagem/i)).toBeTruthy();
    canvas.remove();
  });
});
