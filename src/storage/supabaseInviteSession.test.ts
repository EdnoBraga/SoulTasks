import { afterEach, describe, expect, it } from 'vitest';
import { loadSupabaseSession } from './supabaseStateAdapter';

describe('sessão de convite do Supabase', () => {
  afterEach(() => { window.history.replaceState({}, '', '/'); localStorage.clear(); });

  it('aproveita o access token devolvido pelo link de convite', () => {
    const payload = btoa(JSON.stringify({ sub: 'invited-user', email: 'pallus@example.com' })).replace(/=+$/, '');
    window.history.replaceState({}, '', `/#access_token=header.${payload}.signature&refresh_token=refresh&type=invite`);
    const session = loadSupabaseSession();
    expect(session).toMatchObject({ access_token: expect.stringContaining('header.'), refresh_token: 'refresh', user: { id: 'invited-user', email: 'pallus@example.com' } });
    expect(window.location.hash).toBe('');
  });
});
