import { describe, expect, it } from 'vitest';
import { buildGoogleCalendarUrl } from './googleCalendar';
import type { Card } from '../domain/types';

const card: Card = { id: 'c1', columnId: 'todo', title: 'Revisar homepage', description: 'Validar CTA', priority: 'high', labelIds: [], assigneeIds: [], checklist: [], comments: [], createdAt: '2026-08-18', dueDate: '2026-08-20' };

describe('Google Calendar integration', () => {
  it('creates an official Google Calendar template link with the card date', () => {
    const url = new URL(buildGoogleCalendarUrl(card, 'Site'));
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Revisar homepage');
    expect(url.searchParams.get('dates')).toBe('20260820/20260820');
    expect(url.searchParams.get('details')).toContain('Workflow: Site');
  });
});
