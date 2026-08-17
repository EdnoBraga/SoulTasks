import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';
import type { PresenceStatus } from './types';

export type PresenceEntry = { userId: string; status: PresenceStatus };

function makeClient(session: SupabaseSession, config: SupabaseConfig) {
  const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
  client.realtime.setAuth(session.access_token);
  return client;
}

function normalizePresence(state: Record<string, Array<{ userId?: string; status?: PresenceStatus }>>) {
  return Object.values(state).flatMap((entries) => entries.map((entry) => ({ userId: entry.userId ?? '', status: entry.status ?? 'online' })));
}

export function subscribeToWorkspacePresence(workspaceId: string, session: SupabaseSession, config: SupabaseConfig, onChange: (entries: PresenceEntry[]) => void) {
  const client = makeClient(session, config);
  const channel = client.channel(`workspace:${workspaceId}`, { config: { presence: { key: session.user.id } } });
  const update = () => onChange(normalizePresence(channel.presenceState()));
  channel.on('presence', { event: 'sync' }, update).on('presence', { event: 'join' }, update).on('presence', { event: 'leave' }, update);
  void channel.subscribe((status) => { if (status === 'SUBSCRIBED') void channel.track({ userId: session.user.id, status: 'online' }); });
  return () => { void client.removeChannel(channel); };
}

export function subscribeToMessages(channelId: string, session: SupabaseSession, config: SupabaseConfig, onMessage: (message: Record<string, unknown>) => void) {
  const client = makeClient(session, config);
  const channel: RealtimeChannel = client.channel(`chat:${channelId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${channelId}` }, (payload) => onMessage(payload.new as Record<string, unknown>));
  void channel.subscribe();
  return () => { void client.removeChannel(channel); };
}
