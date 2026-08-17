import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';
import { SOULFORK_WORKSPACE_ID } from './collaborationApi';
import type { CallParticipant, CallRoom, CallSignal } from './callTypes';

type Fetcher = typeof fetch;
type RoomRow = { id: string; workspace_id: string; initiator_id: string; status: CallRoom['status']; created_at: string; ended_at?: string };
type ParticipantRow = { room_id: string; user_id: string; display_name: string; joined_at: string; left_at?: string; active: boolean };

function headers(session: SupabaseSession, config: SupabaseConfig) { return { apikey: config.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }; }
function mapRoom(row: RoomRow): CallRoom { return { id: row.id, workspaceId: row.workspace_id, initiatorId: row.initiator_id, status: row.status, createdAt: row.created_at, endedAt: row.ended_at }; }
function mapParticipant(row: ParticipantRow): CallParticipant { return { roomId: row.room_id, userId: row.user_id, displayName: row.display_name, joinedAt: row.joined_at, leftAt: row.left_at, active: row.active }; }

export async function listActiveCallRooms(session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<CallRoom[]> {
  const response = await fetcher(`${config.url}/rest/v1/call_rooms?select=id,workspace_id,initiator_id,status,created_at,ended_at&workspace_id=eq.${SOULFORK_WORKSPACE_ID}&status=eq.active&order=created_at.desc`, { headers: headers(session, config) });
  if (!response.ok) throw new Error(`Falha ao carregar chamadas (${response.status}).`);
  return (await response.json() as RoomRow[]).map(mapRoom);
}

export async function createCallRoom(workspaceId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<CallRoom> {
  const response = await fetcher(`${config.url}/rest/v1/call_rooms`, { method: 'POST', headers: { ...headers(session, config), Prefer: 'return=representation' }, body: JSON.stringify({ workspace_id: workspaceId, initiator_id: session.user.id }) });
  if (!response.ok) throw new Error(`Falha ao iniciar chamada (${response.status}).`);
  const row = (await response.json() as RoomRow[])[0]; if (!row) throw new Error('A chamada não foi criada.'); return mapRoom(row);
}

export async function listCallParticipants(roomId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<CallParticipant[]> {
  const response = await fetcher(`${config.url}/rest/v1/call_participants?select=room_id,user_id,display_name,joined_at,left_at,active&room_id=eq.${encodeURIComponent(roomId)}&active=eq.true&order=joined_at.asc`, { headers: headers(session, config) });
  if (!response.ok) throw new Error(`Falha ao carregar participantes (${response.status}).`);
  return (await response.json() as ParticipantRow[]).map(mapParticipant);
}

export async function joinCallRoom(roomId: string, session: SupabaseSession, displayName: string, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<CallParticipant> {
  const participants = await listCallParticipants(roomId, session, fetcher, config);
  if (participants.length >= 3 && !participants.some((participant) => participant.userId === session.user.id)) throw new Error('Esta sala já está cheia (limite de 3 pessoas).');
  const response = await fetcher(`${config.url}/rest/v1/call_participants`, { method: 'POST', headers: { ...headers(session, config), Prefer: 'return=representation,resolution=merge-duplicates' }, body: JSON.stringify({ room_id: roomId, user_id: session.user.id, display_name: displayName, active: true, left_at: null }) });
  if (!response.ok) throw new Error(`Falha ao entrar na chamada (${response.status}).`);
  const row = (await response.json() as ParticipantRow[])[0]; if (!row) throw new Error('O participante não foi registrado.'); return mapParticipant(row);
}

export async function leaveCallRoom(roomId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<void> {
  const response = await fetcher(`${config.url}/rest/v1/call_participants?room_id=eq.${encodeURIComponent(roomId)}&user_id=eq.${encodeURIComponent(session.user.id)}`, { method: 'PATCH', headers: headers(session, config), body: JSON.stringify({ active: false, left_at: new Date().toISOString() }) });
  if (!response.ok) throw new Error(`Falha ao sair da chamada (${response.status}).`);
}

export async function endCallRoom(roomId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<void> {
  const response = await fetcher(`${config.url}/rest/v1/call_rooms?id=eq.${encodeURIComponent(roomId)}`, { method: 'PATCH', headers: headers(session, config), body: JSON.stringify({ status: 'ended', ended_at: new Date().toISOString() }) });
  if (!response.ok) throw new Error(`Falha ao encerrar chamada (${response.status}).`);
}

export type CallSubscription = { sendSignal: (signal: CallSignal) => Promise<void>; unsubscribe: () => void };

export function subscribeToCallRoom(roomId: string, session: SupabaseSession, config: SupabaseConfig, onSignal: (signal: CallSignal) => void, onParticipants: (participants: Record<string, unknown>) => void): CallSubscription {
  const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } }); client.realtime.setAuth(session.access_token);
  const channel: RealtimeChannel = client.channel(`call-room:${roomId}`, { config: { presence: { key: session.user.id } } });
  channel.on('broadcast', { event: 'signal' }, ({ payload }) => onSignal(payload as CallSignal)).on('presence', { event: 'sync' }, () => onParticipants(channel.presenceState()));
  void channel.subscribe((status) => { if (status === 'SUBSCRIBED') void channel.track({ userId: session.user.id }); });
  return { sendSignal: async (signal) => { await channel.send({ type: 'broadcast', event: 'signal', payload: signal }); }, unsubscribe: () => { void client.removeChannel(channel); } };
}
