import type { Priority } from './types';

export type QuickCaptureCommands = { labelIds?: string[]; assigneeIds?: string[]; priority?: Priority; dueDate?: string };
export type ParsedQuickCapture = { title: string; commands: QuickCaptureCommands };

const LABEL_COMMANDS: Record<string, string> = { site: 'site', conteúdo: 'content', conteudo: 'content', automação: 'automation', automacao: 'automation', dados: 'data', design: 'design' };
const ASSIGNEE_COMMANDS: Record<string, string> = { braga: 'braga', pallus: 'pallus', kayo: 'kayo' };
const PRIORITY_COMMANDS: Record<string, Priority> = { alta: 'high', média: 'medium', media: 'medium', baixa: 'low' };

function nextWeekdayDate(weekday: number, now: Date): string {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  const daysAhead = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

export function parseQuickCapture(value: string, now = new Date()): ParsedQuickCapture {
  const commands: QuickCaptureCommands = {};
  const title = value.replace(/\/(site|conteúdo|conteudo|automação|automacao|dados|design|braga|pallus|kayo|alta|média|media|baixa|sexta)\b/gi, (_, command: string) => {
    const key = command.toLowerCase();
    if (LABEL_COMMANDS[key]) commands.labelIds = [...(commands.labelIds ?? []), LABEL_COMMANDS[key]];
    if (ASSIGNEE_COMMANDS[key]) commands.assigneeIds = [...(commands.assigneeIds ?? []), ASSIGNEE_COMMANDS[key]];
    if (PRIORITY_COMMANDS[key]) commands.priority = PRIORITY_COMMANDS[key];
    if (key === 'sexta') commands.dueDate = nextWeekdayDate(5, now);
    return '';
  }).replace(/\s+/g, ' ').trim();
  return { title, commands };
}
