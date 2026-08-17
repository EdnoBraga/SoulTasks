export type Priority = 'low' | 'medium' | 'high';

export type Label = { id: string; name: string; color: string };

export type ChecklistItem = { id: string; text: string; done: boolean };

export type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  labelIds: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  comments: string[];
  createdAt: string;
};

export type Column = {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  limit?: number;
  complete: boolean;
  archived?: boolean;
};

export type Board = {
  id: string;
  name: string;
  description: string;
  columnIds: string[];
  columns: Record<string, Column>;
  cards: Record<string, Card>;
};

export type InboxItem = { id: string; title: string; description: string; createdAt: string };

export type BoardState = {
  boards: Record<string, Board>;
  activeBoardId: string;
  inbox: InboxItem[];
  labels: Label[];
};

export type BoardAction =
  | { type: 'replaceState'; state: BoardState }
  | { type: 'createCard'; card: Card }
  | { type: 'updateCard'; card: Card }
  | { type: 'deleteCard'; cardId: string }
  | { type: 'moveCard'; cardId: string; columnId: string }
  | { type: 'createColumn'; column: Column }
  | { type: 'updateColumn'; column: Column }
  | { type: 'deleteColumn'; columnId: string }
  | { type: 'moveColumn'; columnId: string; direction: 'left' | 'right' }
  | { type: 'duplicateCard'; cardId: string }
  | { type: 'captureInbox'; item: InboxItem }
  | { type: 'promoteInbox'; itemId: string; card: Card };
