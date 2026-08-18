import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProfileMenu } from './ProfileSettings';

describe('profile menu', () => {
  it('opens settings and exposes sign out', () => {
    const onSettings = vi.fn();
    const onSignOut = vi.fn();
    render(<ProfileMenu profile={{ displayName: 'Braga' }} onSettings={onSettings} onSignOut={onSignOut} />);

    fireEvent.click(screen.getByRole('button', { name: /abrir perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onSettings).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: /abrir perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: /sair/i }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
