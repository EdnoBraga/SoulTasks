export type PresenceSession = { startedAt: string; endedAt: string | null };

export function totalOnlineSeconds(sessions: PresenceSession[], now = new Date()) {
  return sessions.reduce((total, session) => { const start = new Date(session.startedAt).getTime(); const end = new Date(session.endedAt ?? now).getTime(); return total + Math.max(0, Math.floor((end - start) / 1000)); }, 0);
}

export function formatOnlineDuration(seconds: number) { const minutes = Math.floor(seconds / 60); const hours = Math.floor(minutes / 60); const rest = minutes % 60; return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${minutes} min`; }
