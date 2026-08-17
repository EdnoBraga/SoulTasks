import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkspaceMembers from './WorkspaceMembers';

describe('WorkspaceMembers', () => {
  it('shows member names and online state', () => {
    render(<WorkspaceMembers members={[{ id: '1', userId: 'u1', workspaceId: 'w', role: 'admin', displayName: 'Braga', status: 'active' }]} presence={{ u1: 'online' }} isAdmin onInvite={async () => undefined} />);
    expect(screen.getByText('Braga')).toBeTruthy();
    expect(screen.getByText('online')).toBeTruthy();
    expect(screen.getByRole('button', { name: /convidar membro/i })).toBeTruthy();
  });
});
