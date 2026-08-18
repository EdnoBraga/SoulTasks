import { describe, expect, it } from 'vitest';
import { inviteWorkspaceMember, listChannels, listMessages, listWorkspaceMembers, sendMessage } from './collaborationApi';
import type { SupabaseSession } from '../storage/supabaseStateAdapter';

const session: SupabaseSession = { access_token: 'token', user: { id: 'user-1' } };
const config = { url: 'https://example.supabase.co', key: 'public-key' };

describe('collaboration API', () => {
  it('loads workspace members with the authenticated request', async () => {
    let request = '';
    const fetcher = async (input: RequestInfo | URL) => {
      request = String(input);
      return new Response(JSON.stringify([{ id: 'member-1', user_id: 'user-1', workspace_id: 'workspace-1', role: 'admin', display_name: 'Braga', status: 'active' }]), { status: 200 });
    };
    const members = await listWorkspaceMembers('workspace-1', session, fetcher as typeof fetch, config);
    expect(members[0]?.displayName).toBe('Braga');
    expect(request).toContain('workspace_id=eq.workspace-1');
  });

  it('loads channels and messages using the selected channel', async () => {
    const requests: string[] = [];
    const fetcher = async (input: RequestInfo | URL) => {
      requests.push(String(input));
      return new Response('[]', { status: 200 });
    };
    await listChannels('workspace-1', session, fetcher as typeof fetch, config);
    await listMessages('channel-1', session, fetcher as typeof fetch, config);
    expect(requests[0]).toContain('workspace_id=eq.workspace-1');
    expect(requests[1]).toContain('channel_id=eq.channel-1');
  });

  it('rejects blank messages before making a request', async () => {
    let called = false;
    const fetcher = async () => { called = true; return new Response('[]', { status: 200 }); };
    await expect(sendMessage('channel-1', '   ', session, fetcher as typeof fetch, config)).rejects.toThrow('mensagem vazia');
    expect(called).toBe(false);
  });

  it('sends an administrator invitation to the protected function', async () => {
    let body = '';
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => { body = String(init?.body); return new Response('{}', { status: 200 }); };
    await expect(inviteWorkspaceMember('Pallus@Example.com', 'Pallus', session, fetcher as typeof fetch, config)).resolves.toEqual({ invited: true });
    expect(JSON.parse(body)).toEqual({ email: 'pallus@example.com', displayName: 'Pallus' });
  });

  it('exposes the Edge Function error when an invitation fails', async () => {
    const fetcher = async () => new Response(JSON.stringify({ error: 'SMTP não configurado.' }), { status: 400 });
    await expect(inviteWorkspaceMember('Pallus@Example.com', 'Pallus', session, fetcher as typeof fetch, config)).rejects.toThrow('SMTP não configurado.');
  });
});
