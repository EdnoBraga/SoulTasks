import { describe, expect, it } from 'vitest';
import type { BoardState } from '../domain/types';
import { createSupabaseStateAdapter, type SupabaseSession } from './supabaseStateAdapter';

const state: BoardState = {
  boards: {},
  activeBoardId: 'main',
  inbox: [],
  labels: [],
};

describe('Supabase state adapter', () => {
  it('loads and saves the authenticated workspace snapshot', async () => {
    let stored: Record<string, unknown> | null = null;
    const session: SupabaseSession = { access_token: 'token', user: { id: 'user-1' } };
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') stored = JSON.parse(String(init.body));
      return new Response(stored ? JSON.stringify([{ state: stored.state }]) : '[]', { status: 200 });
    };
    const adapter = createSupabaseStateAdapter(session, 'workspace-1', fetcher as typeof fetch, { url: 'https://example.supabase.co', key: 'public-key' });
    await adapter.save(state);
    expect(await adapter.load()).toEqual(state);
    expect(stored).toMatchObject({ workspace_id: 'workspace-1' });
  });
});
