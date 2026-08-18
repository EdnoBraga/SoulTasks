import type { SupabaseConfig, SupabaseSession } from '../storage/supabaseStateAdapter';

export type EmailNotificationKind = 'assignment' | 'comment' | 'due';
export type EmailNotification = {
  kind: EmailNotificationKind;
  title: string;
  message: string;
  cardTitle: string;
  recipientEmails: string[];
};

export function recipientEmailsForAssignees(assigneeIds: string[], members: Array<{ userId: string; displayName?: string; email?: string }>, currentUserId?: string) {
  return [...new Set(assigneeIds
    .map((assigneeId) => members.find((member) => member.userId === assigneeId || member.displayName?.trim().toLowerCase() === assigneeId.trim().toLowerCase()))
    .filter((member): member is { userId: string; email: string } => Boolean(member?.email && member.userId !== currentUserId))
    .map((member) => member.email.trim().toLowerCase())
    .filter((email) => /^\S+@\S+\.\S+$/.test(email)))];
}

type Fetcher = typeof fetch;

function normalizeRecipients(recipientEmails: string[]) {
  return [...new Set(recipientEmails.map((email) => email.trim().toLowerCase()).filter((email) => /^\S+@\S+\.\S+$/.test(email)))];
}

export async function notifyWorkspaceByEmail(notification: EmailNotification, session: SupabaseSession, fetcher: Fetcher = fetch, config: SupabaseConfig): Promise<{ sent: number }> {
  const recipientEmails = normalizeRecipients(notification.recipientEmails).filter((email) => email !== session.user.email?.trim().toLowerCase());
  if (!recipientEmails.length) return { sent: 0 };
  const response = await fetcher(`${config.url}/functions/v1/notify-workspace-email`, {
    method: 'POST',
    headers: { apikey: config.key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...notification, recipientEmails }),
  });
  const body = await response.json() as { sent?: number; error?: string };
  if (!response.ok) throw new Error(body.error || `Falha ao enviar notificação por e-mail (${response.status}).`);
  return { sent: body.sent ?? recipientEmails.length };
}
