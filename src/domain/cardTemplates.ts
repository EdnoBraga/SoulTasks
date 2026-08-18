import type { Card, CardTemplate } from './types';

export function cardToTemplate(card: Card, name: string, recurrence: CardTemplate['recurrence']): CardTemplate {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: card.description,
    priority: card.priority,
    labelIds: [...card.labelIds],
    assigneeIds: [...card.assigneeIds],
    checklist: card.checklist.map((item) => ({ ...item, id: crypto.randomUUID(), done: false })),
    recurrence,
  };
}

export function applyCardTemplate(template: CardTemplate, columnId: string, now = new Date()): Card {
  const dueDate = template.recurrence === 'none' ? undefined : nextRecurrenceDate(template.recurrence, now);
  return {
    id: crypto.randomUUID(),
    columnId,
    title: template.name,
    description: template.description,
    priority: template.priority,
    labelIds: [...template.labelIds],
    assigneeIds: [...template.assigneeIds],
    checklist: template.checklist.map((item) => ({ ...item, id: crypto.randomUUID(), done: false })),
    comments: [],
    createdAt: now.toISOString(),
    ...(dueDate ? { dueDate } : {}),
  };
}

function nextRecurrenceDate(recurrence: Exclude<CardTemplate['recurrence'], 'none'>, now: Date) {
  const date = new Date(now);
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7);
  else date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}
