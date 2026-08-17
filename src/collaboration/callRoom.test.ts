import { describe, expect, it } from 'vitest';
import { joinCallRoom } from './callRoom';

const session = { access_token: 'token', user: { id: 'u4', email: 'u4@example.com' } };
const config = { url: 'https://example.supabase.co', key: 'key' };

describe('joinCallRoom', () => {
  it('bloqueia a quarta pessoa sem criar participante', async () => {
    const calls: RequestInit[] = [];
    const fetcher = async (url: string, init?: RequestInit) => { calls.push(init ?? {}); if (url.includes('call_participants?select')) return new Response(JSON.stringify([{ room_id: 'r', user_id: 'u1', display_name: 'Braga', joined_at: '', active: true }, { room_id: 'r', user_id: 'u2', display_name: 'Pallus', joined_at: '', active: true }, { room_id: 'r', user_id: 'u3', display_name: 'Kayo', joined_at: '', active: true }])); return new Response('{}'); };
    await expect(joinCallRoom('r', session, 'Novo', fetcher as typeof fetch, config)).rejects.toThrow(/cheia/i);
    expect(calls).toHaveLength(1);
  });
});
