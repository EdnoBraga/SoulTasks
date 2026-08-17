import type { BoardState } from '../domain/types';

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  user: { id: string; email?: string };
};

type Fetcher = typeof fetch;
export type SupabaseConfig = { url: string; key: string };

const SESSION_KEY = 'soultasks-supabase-session-v1';

export function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

export function loadSupabaseSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as SupabaseSession : null;
  } catch { return null; }
}

export function saveSupabaseSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export async function signInWithPassword(email: string, password: string, fetcher: Fetcher = fetch) {
  const config = getSupabaseConfig();
  if (!config) throw new Error('Supabase não configurado.');
  const response = await fetcher(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const body = await response.json() as SupabaseSession & { msg?: string; error_description?: string };
  if (!response.ok) throw new Error(body.error_description || body.msg || 'Não foi possível entrar.');
  return body;
}

export async function signUpWithPassword(email: string, password: string, fetcher: Fetcher = fetch) {
  const config = getSupabaseConfig();
  if (!config) throw new Error('Supabase não configurado.');
  const response = await fetcher(`${config.url}/auth/v1/signup`, {
    method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  });
  const body = await response.json() as SupabaseSession & { msg?: string; error_description?: string };
  if (!response.ok) throw new Error(body.error_description || body.msg || 'Não foi possível criar a conta.');
  return body;
}

export async function refreshSupabaseSession(session: SupabaseSession, fetcher: Fetcher = fetch) {
  const config = getSupabaseConfig();
  if (!config || !session.refresh_token) return session;
  const response = await fetcher(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) throw new Error('Sessão expirada. Entre novamente.');
  return await response.json() as SupabaseSession;
}

export function createSupabaseStateAdapter(session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = configured ?? getSupabaseConfig();
  if (!config) throw new Error('Supabase não configurado.');
  const headers = { apikey: config.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
  const endpoint = `${config.url}/rest/v1/board_snapshots`;
  return {
    async load(): Promise<BoardState | null> {
      const response = await fetcher(`${endpoint}?select=state&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`, { headers });
      if (!response.ok) throw new Error(`Falha ao carregar o quadro (${response.status}).`);
      const rows = await response.json() as { state: BoardState }[];
      return rows[0]?.state ?? null;
    },
    async save(state: BoardState) {
      const response = await fetcher(endpoint, {
        method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: session.user.id, state, updated_at: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`Falha ao salvar o quadro (${response.status}).`);
    },
  };
}
