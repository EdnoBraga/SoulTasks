import { describe, expect, it } from 'vitest';
import { notifyWorkspaceByEmail, recipientEmailsForAssignees } from './emailNotifications';
import type { SupabaseSession } from '../storage/supabaseStateAdapter';

const session: SupabaseSession = { access_token: 'token', user: { id: 'user-1', email: 'braga@example.com' } };
const config = { url: 'https://example.supabase.co', key: 'public-key' };

describe('notifyWorkspaceByEmail', () => {
  it('sends an authenticated assignment notification to the email function', async () => {
    let request = '';
    let init: RequestInit | undefined;
    const fetcher = async (input: RequestInfo | URL, options?: RequestInit) => {
      request = String(input);
      init = options;
      return new Response(JSON.stringify({ sent: 1 }), { status: 200 });
    };

    await expect(notifyWorkspaceByEmail({
      kind: 'assignment',
      title: 'Nova atribuição',
      message: 'Braga atribuiu uma tarefa a você.',
      cardTitle: 'Revisar homepage',
      recipientEmails: ['Pallus@Example.com', 'braga@example.com'],
    }, session, fetcher as typeof fetch, config)).resolves.toEqual({ sent: 1 });

    expect(request).toBe('https://example.supabase.co/functions/v1/notify-workspace-email');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      kind: 'assignment',
      recipientEmails: ['pallus@example.com'],
      cardTitle: 'Revisar homepage',
    });
  });

  it('does not call the function when there are no recipients', async () => {
    let called = false;
    const fetcher = async () => { called = true; return new Response('{}', { status: 200 }); };
    await expect(notifyWorkspaceByEmail({ kind: 'comment', title: 'Comentário', message: 'Novo comentário', cardTitle: 'Tarefa', recipientEmails: [] }, session, fetcher as typeof fetch, config)).resolves.toEqual({ sent: 0 });
    expect(called).toBe(false);
  });

  it('resolves assigned workspace members to unique email recipients', () => {
    expect(recipientEmailsForAssignees(['braga', 'pallus', 'pallus'], [
      { userId: 'user-1', displayName: 'Braga', email: 'braga@example.com' },
      { userId: 'user-2', displayName: 'Pallus', email: 'pallus@example.com' },
    ], 'user-1')).toEqual(['pallus@example.com']);
  });
});
