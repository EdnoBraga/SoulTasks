import type { Card } from './types';

export type CardAttention = { overdue: boolean; unassigned: boolean };

export function getCardAttention(card: Card, completed: boolean, now = new Date()): CardAttention {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const due = card.dueDate ? new Date(`${card.dueDate}T00:00:00`) : undefined;
  return { overdue: !completed && Boolean(due && due < today), unassigned: card.assigneeIds.length === 0 };
}
