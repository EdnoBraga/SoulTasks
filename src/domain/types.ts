export type Priority = 'low' | 'medium' | 'high';

export type Label = { id: string; name: string; color: string };

export type ChecklistItem = { id: string; text: string; done: boolean; assigneeId?: string };

export type QuickCaptureCommands = { labelIds?: string[]; assigneeIds?: string[]; priority?: Priority; dueDate?: string };

export type CardAttachment = { id: string; name: string; type: string; size: number; dataUrl: string; createdAt: string };

export type CardHistoryEntry = { id: string; author: string; summary: string; createdAt: string };

export type CardTemplateRecurrence = 'none' | 'weekly' | 'monthly';

export type CardTemplate = {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  labelIds: string[];
  assigneeIds: string[];
  checklist: ChecklistItem[];
  recurrence: CardTemplateRecurrence;
};

export type Card = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  labelIds: string[];
  assigneeIds: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  comments: string[];
  attachments?: CardAttachment[];
  createdAt: string;
  history?: CardHistoryEntry[];
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

export type InboxItem = { id: string; title: string; description: string; createdAt: string; quickCommands?: QuickCaptureCommands };

export type BoardState = {
  boards: Record<string, Board>;
  activeBoardId: string;
  inbox: InboxItem[];
  labels: Label[];
  cardTemplates?: CardTemplate[];
};

export type BoardAction =
  | { type: 'replaceState'; state: BoardState }
  | { type: 'switchBoard'; boardId: string }
  | { type: 'createCard'; card: Card }
  | { type: 'updateCard'; card: Card }
  | { type: 'deleteCard'; cardId: string }
  | { type: 'moveCard'; cardId: string; columnId: string; actor?: string }
  | { type: 'createColumn'; column: Column }
  | { type: 'updateColumn'; column: Column }
  | { type: 'deleteColumn'; columnId: string }
  | { type: 'moveColumn'; columnId: string; direction: 'left' | 'right' }
  | { type: 'duplicateCard'; cardId: string }
  | { type: 'createCardTemplate'; template: CardTemplate }
  | { type: 'deleteCardTemplate'; templateId: string }
  | { type: 'captureInbox'; item: InboxItem }
  | { type: 'updateInbox'; item: InboxItem }
  | { type: 'deleteInbox'; itemId: string }
  | { type: 'promoteInbox'; itemId: string; card: Card };
