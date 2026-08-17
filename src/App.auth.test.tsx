import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthPanel } from './App';

describe('private authentication surface', () => {
  it('does not render public account creation', () => {
    render(<AuthPanel onAuthenticated={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /criar conta/i })).toBeNull();
    expect(screen.getByText(/acesso é criado por convite do administrador/i)).toBeTruthy();
  });
});
