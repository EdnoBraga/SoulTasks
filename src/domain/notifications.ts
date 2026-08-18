import type { Card } from './types';

export type NotificationKind = 'assignment' | 'comment' | 'due';
export type AppNotification = { id: string; kind: NotificationKind; title: string; message: string; createdAt: string; cardId: string };
type NotificationOptions = { assigneeId: string; displayName: string; now?: Date };

export function buildNotifications(cards: Card[], { assigneeId, displayName, now = new Date() }: NotificationOptions): AppNotification[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 3);
  const notifications: AppNotification[] = [];

  cards.forEach((card) => {
    const history = [...(card.history ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latestAssignment = history.find((entry) => entry.summary.includes('responsáveis') && entry.author !== displayName && card.assigneeIds.includes(assigneeId));
    const latestComment = history.find((entry) => entry.summary.includes('comentários') && entry.author !== displayName);
    if (latestAssignment) notifications.push({ id: `${card.id}-assignment-${latestAssignment.id}`, kind: 'assignment', title: 'Nova atribuição', message: `${latestAssignment.author} atribuiu este card a você.`, createdAt: latestAssignment.createdAt, cardId: card.id });
    if (latestComment) notifications.push({ id: `${card.id}-comment-${latestComment.id}`, kind: 'comment', title: 'Novo comentário', message: `${latestComment.author} comentou neste card.`, createdAt: latestComment.createdAt, cardId: card.id });

    if (card.dueDate && card.assigneeIds.includes(assigneeId)) {
      const due = new Date(`${card.dueDate}T00:00:00`);
      if (due >= today && due <= limit) notifications.push({ id: `${card.id}-due-${card.dueDate}`, kind: 'due', title: 'Prazo próximo', message: `Este card vence em ${due.toLocaleDateString('pt-BR')}.`, createdAt: due.toISOString(), cardId: card.id });
    }
  });

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
