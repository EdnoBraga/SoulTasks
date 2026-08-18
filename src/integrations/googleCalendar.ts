import type { Card } from '../domain/types';

function toGoogleDate(date: string) { return date.replaceAll('-', ''); }

export function buildGoogleCalendarUrl(card: Card, boardName: string) {
  const params = new URLSearchParams({ action: 'TEMPLATE', text: card.title, dates: `${toGoogleDate(card.dueDate ?? new Date().toISOString().slice(0, 10))}/${toGoogleDate(card.dueDate ?? new Date().toISOString().slice(0, 10))}`, details: [card.description, `Workflow: ${boardName}`].filter(Boolean).join('\n\n') });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
