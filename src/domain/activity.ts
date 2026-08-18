import type { Board, BoardState, Card } from './types';

export type ActivityEvent = { id: string; date: string; title: string; detail: string; card?: Card };
export type ActivityGroup = { id: string; name: string; items: ActivityEvent[] };

export function buildActivityGroups(state: BoardState, boards: Board[]): ActivityGroup[] {
  const groups = boards.map((board) => {
    const cards = Object.values(board.cards);
    const creationItems: ActivityEvent[] = cards.map((card) => ({ id: `${card.id}-created`, date: card.createdAt, title: card.title, detail: 'Card disponível no quadro', card }));
    const historyItems: ActivityEvent[] = cards.flatMap((card) => (card.history ?? []).map((entry) => ({ id: entry.id, date: entry.createdAt, title: card.title, detail: `${entry.author} ${entry.summary}`, card })));
    return { id: board.id, name: board.name, items: [...creationItems, ...historyItems].sort((a, b) => b.date.localeCompare(a.date)) };
  });
  const inboxItems: ActivityEvent[] = state.inbox.map((item) => ({ id: item.id, date: item.createdAt, title: item.title, detail: 'Captura adicionada à Inbox' }));
  if (inboxItems.length) groups.unshift({ id: 'inbox', name: 'Geral / Inbox', items: inboxItems });
  return groups.filter((group) => group.items.length);
}
