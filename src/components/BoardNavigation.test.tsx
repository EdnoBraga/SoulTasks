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
});
