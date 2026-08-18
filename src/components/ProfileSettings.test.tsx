import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProfileMenu } from './ProfileSettings';
import ProfileSettings from './ProfileSettings';

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

describe('admin team settings', () => {
  it('shows member permissions only inside administrator settings', () => {
    render(<ProfileSettings profile={{ displayName: 'Braga' }} isAdmin members={[{ id: '1', userId: 'u1', workspaceId: 'w', role: 'member', permission: 'editor', displayName: 'Kayo', status: 'active' }]} onUpdatePermission={vi.fn(async () => undefined)} onClose={vi.fn()} onSaveProfile={vi.fn()} onSavePassword={vi.fn(async () => undefined)} />);
    expect(screen.getByText(/permissões da equipe/i)).toBeTruthy();
    expect(screen.getByRole('combobox', { name: /permissão de Kayo/i })).toBeTruthy();
  });
});
