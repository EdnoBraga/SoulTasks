import type { MeetingMinute } from './meetingMinutes';
import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';

type Fetcher = typeof fetch;
type MeetingMinuteRow = {
  id: string;
  workspace_id: string;
  author_id: string;
  title: string;
  started_at: string;
  ended_at: string;
  participants: string[];
  sections: MeetingMinute['sections'];
  decisions: string[];
  next_steps: string[];
};

function endpoint(config: SupabaseConfig, query: string) { return `${config.url}/rest/v1/meeting_minutes?${query}`; }
function headers(session: SupabaseSession, config: SupabaseConfig) { return { apikey: config.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }; }
function fromRow(row: MeetingMinuteRow): MeetingMinute { return { id: row.id, title: row.title, startedAt: row.started_at, endedAt: row.ended_at, participants: row.participants ?? [], sections: row.sections ?? [], decisions: row.decisions ?? [], nextSteps: row.next_steps ?? [] }; }

export async function listMeetingMinutes(workspaceId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<MeetingMinute[]> {
  const response = await fetcher(endpoint(config, `select=id,workspace_id,author_id,title,started_at,ended_at,participants,sections,decisions,next_steps&workspace_id=eq.${encodeURIComponent(workspaceId)}&order=started_at.desc`), { headers: headers(session, config) });
  if (!response.ok) throw new Error(`Falha ao carregar atas (${response.status}).`);
  return (await response.json() as MeetingMinuteRow[]).map(fromRow);
}

export async function saveMeetingMinuteRemote(workspaceId: string, minute: MeetingMinute, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<void> {
  const response = await fetcher(endpoint(config, ''), { method: 'POST', headers: { ...headers(session, config), Prefer: 'return=minimal' }, body: JSON.stringify({ id: minute.id, workspace_id: workspaceId, author_id: session.user.id, title: minute.title, started_at: minute.startedAt, ended_at: minute.endedAt, participants: minute.participants, sections: minute.sections, decisions: minute.decisions, next_steps: minute.nextSteps }) });
  if (!response.ok) throw new Error(`Falha ao salvar ata (${response.status}).`);
}

export async function deleteMeetingMinuteRemote(minuteId: string, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<void> {
  const response = await fetcher(endpoint(config, `id=eq.${encodeURIComponent(minuteId)}`), { method: 'DELETE', headers: headers(session, config) });
  if (!response.ok) throw new Error(`Falha ao excluir ata (${response.status}).`);
}
