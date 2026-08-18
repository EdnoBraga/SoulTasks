import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';
import type { ChatChannel, ChatMessage, WorkspaceMember } from './types';
import type { PresenceSession } from '../domain/presenceDuration';

export const SOULFORK_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

type Fetcher = typeof fetch;
type MemberRow = { id: string; user_id: string; workspace_id: string; role: WorkspaceMember['role']; permission?: WorkspaceMember['permission']; display_name: string; email?: string; status: WorkspaceMember['status'] };
type ChannelRow = { id: string; workspace_id: string; kind: ChatChannel['kind']; name: string; created_at: string };
type MessageRow = { id: string; channel_id: string; author_id: string; content: string; created_at: string; updated_at?: string };

function requestHeaders(session: SupabaseSession) { return { apikey: '', Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }; }
function endpoint(config: SupabaseConfig, resource: string, query: string) { return `${config.url}/rest/v1/${resource}?${query}`; }
function resolveConfig(configured?: SupabaseConfig) { if (!configured) throw new Error('Supabase não configurado.'); return configured; }
async function read<T>(url: string, session: SupabaseSession, fetcher: Fetcher, config: SupabaseConfig): Promise<T[]> {
  const response = await fetcher(url, { headers: { ...requestHeaders(session), apikey: config.key } });
  if (!response.ok) throw new Error(`Falha ao carregar colaboração (${response.status}).`);
  return await response.json() as T[];
}

export async function listWorkspaceMembers(workspaceId: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  const rows = await read<MemberRow>(endpoint(config, 'workspace_members', `select=id,user_id,workspace_id,role,permission,display_name,email,status&workspace_id=eq.${encodeURIComponent(workspaceId)}&status=eq.active&order=display_name.asc`), session, fetcher, config);
  return rows.map((row) => ({ id: row.id, userId: row.user_id, workspaceId: row.workspace_id, role: row.role, permission: row.permission ?? (row.role === 'admin' ? 'admin' : 'editor'), displayName: row.display_name, email: row.email, status: row.status }));
}

export async function updateMemberPermission(memberId: string, permission: NonNullable<WorkspaceMember['permission']>, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  const response = await fetcher(`${config.url}/rest/v1/workspace_members?id=eq.${encodeURIComponent(memberId)}`, { method: 'PATCH', headers: { ...requestHeaders(session), apikey: config.key, Prefer: 'return=minimal' }, body: JSON.stringify({ permission }) });
  if (!response.ok) throw new Error(`Falha ao atualizar permissão (${response.status}).`);
}

export async function recordPresenceSession(sessionId: string, workspaceId: string, startedAt: string, endedAt: string | null, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  const response = await fetcher(`${config.url}/rest/v1/presence_sessions`, { method: 'POST', headers: { ...requestHeaders(session), apikey: config.key, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: sessionId, workspace_id: workspaceId, user_id: session.user.id, started_at: startedAt, last_seen_at: new Date().toISOString(), ended_at: endedAt }) });
  if (!response.ok) throw new Error(`Falha ao registrar presença (${response.status}).`);
}

export async function listPresenceSessions(workspaceId: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  return read<PresenceSession & { user_id: string }>(endpoint(config, 'presence_sessions', `select=user_id,started_at,ended_at&workspace_id=eq.${encodeURIComponent(workspaceId)}&order=started_at.desc&limit=500`), session, fetcher, config);
}

export async function listChannels(workspaceId: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  const rows = await read<ChannelRow>(endpoint(config, 'chat_channels', `select=id,workspace_id,kind,name,created_at&workspace_id=eq.${encodeURIComponent(workspaceId)}&order=created_at.asc`), session, fetcher, config);
  return rows.map((row) => ({ id: row.id, workspaceId: row.workspace_id, kind: row.kind, name: row.name, createdAt: row.created_at }));
}

export async function listMessages(channelId: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  const rows = await read<MessageRow>(endpoint(config, 'chat_messages', `select=id,channel_id,author_id,content,created_at,updated_at&channel_id=eq.${encodeURIComponent(channelId)}&order=created_at.asc&limit=100`), session, fetcher, config);
  return rows.map((row) => ({ id: row.id, channelId: row.channel_id, authorId: row.author_id, content: row.content, createdAt: row.created_at, updatedAt: row.updated_at }));
}

export async function sendMessage(channelId: string, content: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig): Promise<ChatMessage> {
  if (!content.trim()) throw new Error('Não é possível enviar uma mensagem vazia.');
  const config = resolveConfig(configured);
  const response = await fetcher(`${config.url}/rest/v1/chat_messages`, { method: 'POST', headers: { ...requestHeaders(session), apikey: config.key, Prefer: 'return=representation' }, body: JSON.stringify({ channel_id: channelId, content: content.trim() }) });
  if (!response.ok) throw new Error(`Falha ao enviar mensagem (${response.status}).`);
  const row = (await response.json() as MessageRow[])[0];
  if (!row) throw new Error('O Supabase não retornou a mensagem criada.');
  return { id: row.id, channelId: row.channel_id, authorId: row.author_id, content: row.content, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function loadWorkspaceContext(session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const [members, channels] = await Promise.all([
    listWorkspaceMembers(SOULFORK_WORKSPACE_ID, session, fetcher, configured),
    listChannels(SOULFORK_WORKSPACE_ID, session, fetcher, configured),
  ]);
  const currentMember = members.find((member) => member.userId === session.user.id);
  if (!currentMember) throw new Error('Este usuário ainda não foi convidado para o workspace SoulFork.');
  return { workspaceId: SOULFORK_WORKSPACE_ID, members, channels, currentMember };
}

export async function inviteWorkspaceMember(email: string, displayName: string, session: SupabaseSession, fetcher: Fetcher = fetch, configured?: SupabaseConfig) {
  const config = resolveConfig(configured);
  if (!email.trim() || !displayName.trim()) throw new Error('Informe nome e e-mail do membro.');
  const response = await fetcher(`${config.url}/functions/v1/invite-workspace-member`, { method: 'POST', headers: { ...requestHeaders(session), apikey: config.key }, body: JSON.stringify({ email: email.trim().toLowerCase(), displayName: displayName.trim() }) });
  if (!response.ok) {
    let detail = '';
    try { const body = await response.json() as { error?: string; message?: string }; detail = body.error || body.message || ''; } catch { /* resposta sem JSON */ }
    if (response.status === 403) throw new Error(detail || 'Somente o administrador pode convidar membros.');
    if (response.status === 404) throw new Error('O serviço de convites ainda não está publicado no Supabase.');
    throw new Error(detail || `Falha ao enviar convite (${response.status}).`);
  }
  return { invited: true };
}
