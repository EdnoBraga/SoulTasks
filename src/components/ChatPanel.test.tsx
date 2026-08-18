import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ChatPanel from './ChatPanel';

describe('ChatPanel', () => {
  it('renders the general channel and sends a message', () => {
    let sent = '';
    render(<ChatPanel channels={[{ id: 'general', workspaceId: 'w', kind: 'general', name: 'Geral', createdAt: '' }]} messages={[]} activeChannelId="general" currentUserId="u1" onSelectChannel={() => undefined} onSend={(value) => { sent = value; }} />);
    expect(screen.getByRole('button', { name: /geral/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /transcrever mensagem com microfone/i })).toBeTruthy();
    const input = screen.getByPlaceholderText(/escreva uma mensagem/i);
    fireEvent.change(input, { target: { value: 'Olá equipe' } });
    act(() => { screen.getByRole('button', { name: /enviar/i }).click(); });
    expect(sent).toBe('Olá equipe');
  });
});
