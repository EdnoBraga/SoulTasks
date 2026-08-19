import type { BoardState, Card, ChecklistItem } from './types';

function withoutAssignee(items: ChecklistItem[], assigneeId: string) {
  return items.map((item) => item.assigneeId === assigneeId ? { ...item, assigneeId: undefined } : item);
}

function cleanCard(card: Card, assigneeId: string): Card {
  return {
    ...card,
    assigneeIds: card.assigneeIds.filter((id) => id !== assigneeId),
    checklist: withoutAssignee(card.checklist, assigneeId),
  };
}

export function removeAssigneeFromState(state: BoardState, assigneeId: string): BoardState {
  return {
    ...state,
    boards: Object.fromEntries(Object.entries(state.boards).map(([boardId, board]) => [boardId, {
      ...board,
      cards: Object.fromEntries(Object.entries(board.cards).map(([cardId, card]) => [cardId, cleanCard(card, assigneeId)])),
    }])),
    inbox: state.inbox.map((item) => item.quickCommands?.assigneeIds?.includes(assigneeId)
      ? { ...item, quickCommands: { ...item.quickCommands, assigneeIds: item.quickCommands.assigneeIds.filter((id) => id !== assigneeId) } }
      : item),
    cardTemplates: state.cardTemplates?.map((template) => ({
      ...template,
      assigneeIds: template.assigneeIds.filter((id) => id !== assigneeId),
      checklist: withoutAssignee(template.checklist, assigneeId),
    })),
  };
}
