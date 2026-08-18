import { SOULFORK_ASSIGNEES } from './assignees';

export function extractMentions(text: string) {
  const ids: string[] = [];
  for (const match of text.matchAll(/@([\p{L}]+)/gu)) {
    const name = match[1]?.toLocaleLowerCase('pt-BR');
    const assignee = SOULFORK_ASSIGNEES.find((item) => item.name.toLocaleLowerCase('pt-BR') === name);
    if (assignee && !ids.includes(assignee.id)) ids.push(assignee.id);
  }
  return ids;
}

export function mentionSuggestions(text: string) {
  const match = text.match(/(?:^|\s)@([\p{L}]*)$/u);
  if (!match) return [];
  const query = match[1]?.toLocaleLowerCase('pt-BR') ?? '';
  return SOULFORK_ASSIGNEES.filter((item) => item.name.toLocaleLowerCase('pt-BR').startsWith(query));
}
