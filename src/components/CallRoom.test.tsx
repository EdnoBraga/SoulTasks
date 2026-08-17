import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CallRoom from './CallRoom';

describe('CallRoom', () => {
  it('exibe consentimento antes de solicitar mídia', () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
    render(<CallRoom session={{ access_token: 'token', user: { id: 'u1', email: 'braga@example.com' } }} config={{ url: 'https://example.supabase.co', key: 'key' }} members={[{ id: 'm1', userId: 'u1', workspaceId: 'w', role: 'admin', displayName: 'Braga', status: 'active' }]} onNotify={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /iniciar chamada/i }));
    expect(screen.getByRole('heading', { name: /consentimento da reunião/i })).toBeTruthy();
    expect(getUserMedia).toHaveBeenCalledTimes(0);
  });
});
