import type { Board, BoardState, Column } from './types';

export const WORKFLOW_DEFINITIONS = [
  { id: 'design', name: 'Design', description: 'Identidade, peças e experiências visuais.', color: '#F6B3FF', icon: '✦', labelId: 'design' },
  { id: 'content', name: 'Conteúdo', description: 'Pautas, artigos, Reels e calendário editorial.', color: '#63D9FF', icon: '◌', labelId: 'content' },
  { id: 'automation', name: 'Automação', description: 'Fluxos, integrações e operações automáticas.', color: '#A78BFA', icon: '↗', labelId: 'automation' },
  { id: 'data', name: 'Dados', description: 'Indicadores, análises e decisões orientadas por dados.', color: '#8FD41F', icon: '∿', labelId: 'data' },
  { id: 'site', name: 'Site', description: 'Páginas, melhorias e manutenção do ecossistema web.', color: '#5B8CFF', icon: '⌁', labelId: 'site' },
] as const;

function workflowBoard(id: string, name: string, description: string, columns: Record<string, Column>, columnIds: string[]): Board {
  return { id, name, description, columnIds, columns: Object.fromEntries(columnIds.map((columnId) => [columnId, { ...columns[columnId]! }])), cards: {} };
}

export function ensureWorkflowBoards(state: BoardState): BoardState {
  const general = state.boards.main;
  if (!general) return state;
  const boards = { ...state.boards };
  for (const definition of WORKFLOW_DEFINITIONS) if (!boards[definition.id]) boards[definition.id] = workflowBoard(definition.id, definition.name, definition.description, general.columns, general.columnIds);
  return { ...state, boards };
}

export function buildGeneralBoard(state: BoardState): Board {
  const general = state.boards.main!;
  const departmentCards = WORKFLOW_DEFINITIONS.flatMap((definition) => Object.values(state.boards[definition.id]?.cards ?? {}));
  const cards = { ...general.cards, ...Object.fromEntries(departmentCards.map((card) => [card.id, card])) };
  return { ...general, name: 'Operação SoulFork', description: 'Visão geral: tarefas de todos os workflows da empresa.', cards };
}
