import type { BoardAction, BoardState } from './types';

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const board = state.boards[state.activeBoardId];
  if (!board) return state;
  const cards = { ...board.cards };
  const columns = { ...board.columns };
  switch (action.type) {
    case 'createCard':
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, cards: { ...cards, [action.card.id]: action.card } } } };
    case 'updateCard':
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, cards: { ...cards, [action.card.id]: action.card } } } };
    case 'deleteCard': {
      const next = { ...cards }; delete next[action.cardId];
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, cards: next } } };
    }
    case 'moveCard': {
      const card = cards[action.cardId];
      if (!card) return state;
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, cards: { ...cards, [action.cardId]: { ...card, columnId: action.columnId } } } } };
    }
    case 'createColumn':
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, columnIds: [...board.columnIds, action.column.id], columns: { ...columns, [action.column.id]: action.column } } } };
    case 'updateColumn':
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, columns: { ...columns, [action.column.id]: action.column } } } };
    case 'deleteColumn': {
      const next = { ...columns }; delete next[action.columnId];
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, columns: next, columnIds: board.columnIds.filter((id) => id !== action.columnId) } } };
    }
    case 'captureInbox': return { ...state, inbox: [action.item, ...state.inbox] };
    case 'promoteInbox': {
      const item = state.inbox.find((entry) => entry.id === action.itemId);
      if (!item) return state;
      return { ...state, inbox: state.inbox.filter((entry) => entry.id !== action.itemId), boards: { ...state.boards, [board.id]: { ...board, cards: { ...cards, [action.card.id]: action.card } } } };
    }
    default: return state;
  }
}
