export const SOULFORK_ASSIGNEES = [
  { id: 'braga', name: 'Braga' },
  { id: 'pallus', name: 'Pallus' },
  { id: 'kayo', name: 'Kayo' },
] as const;

export function toggleAssignee(selected: string[], assigneeId: string): string[] {
  return selected.includes(assigneeId)
    ? selected.filter((id) => id !== assigneeId)
    : [...selected, assigneeId];
}
