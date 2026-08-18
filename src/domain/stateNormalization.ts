import type { Board, BoardState, Card, Column } from './types';

function normalizeCard(raw: Partial<Card> & Pick<Card, 'id' | 'columnId' | 'title'>): Card {
  return {
    id: raw.id,
    columnId: raw.columnId,
    title: raw.title ?? '',
    description: raw.description ?? '',
    priority: raw.priority ?? 'medium',
    labelIds: Array.isArray(raw.labelIds) ? raw.labelIds : [],
    assigneeIds: Array.isArray(raw.assigneeIds) ? raw.assigneeIds : [],
    dueDate: raw.dueDate,
    checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

function normalizeBoard(board: Board): Board {
  const columns = Object.fromEntries(Object.entries(board.columns ?? {}).map(([id, column]) => [id, column as Column]));
  const cards = Object.fromEntries(Object.entries(board.cards ?? {}).map(([id, card]) => [id, normalizeCard({ ...(card as Card), id: card.id ?? id, columnId: card.columnId ?? board.columnIds?.[0] ?? '', title: card.title ?? '' })]));
  return { ...board, columnIds: Array.isArray(board.columnIds) ? board.columnIds : Object.keys(columns), columns, cards };
}

export function normalizeBoardState(state: BoardState): BoardState {
  return {
    ...state,
    boards: Object.fromEntries(Object.entries(state.boards ?? {}).map(([id, board]) => [id, normalizeBoard({ ...(board as Board), id: board.id ?? id, columnIds: board.columnIds ?? [], columns: board.columns ?? {}, cards: board.cards ?? {} })])),
    inbox: Array.isArray(state.inbox) ? state.inbox : [],
    labels: Array.isArray(state.labels) ? state.labels : [],
    ...(state.cardTemplates ? { cardTemplates: state.cardTemplates } : {}),
  };
}
