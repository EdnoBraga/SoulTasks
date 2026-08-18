export const SOULFORK_ASSIGNEES = [
  { id: 'braga', name: 'Braga' },
  { id: 'pallus', name: 'Pallus' },
  { id: 'kayo', name: 'Kayo' },
] as const;

export const ASSIGNEE_COLORS: Record<string, string> = {
  braga: '#5B8CFF',
  pallus: '#79D85B',
  kayo: '#F05B64',
};

export function getAssigneeColors(assigneeIds: string[]): string[] {
  return assigneeIds.map((id) => ASSIGNEE_COLORS[id]).filter((color): color is string => Boolean(color));
}

export function toggleAssignee(selected: string[], assigneeId: string): string[] {
  return selected.includes(assigneeId)
    ? selected.filter((id) => id !== assigneeId)
    : [...selected, assigneeId];
}
