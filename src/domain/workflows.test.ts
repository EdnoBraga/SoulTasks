import { describe, expect, it } from 'vitest';
import { createDemoState } from './demoData';
import { buildGeneralBoard, ensureWorkflowBoards, WORKFLOW_DEFINITIONS } from './workflows';

describe('workflows', () => {
  it('cria os cinco workflows departamentais sem apagar o geral', () => {
    const state = ensureWorkflowBoards(createDemoState());
    expect(Object.keys(state.boards)).toEqual(expect.arrayContaining(['main', ...WORKFLOW_DEFINITIONS.map((item) => item.id)]));
    expect(Object.keys(state.boards.main!.cards)).toHaveLength(5);
  });

  it('consolida cards departamentais na visão geral', () => {
    const state = ensureWorkflowBoards(createDemoState());
    const site = state.boards.site!;
    const card = { ...state.boards.main!.cards['card-2']!, id: 'site-card', columnId: site.columnIds[0]! };
    const next = { ...state, boards: { ...state.boards, site: { ...site, cards: { [card.id]: card } } } };
    expect(buildGeneralBoard(next).cards['site-card']!.title).toBe('Revisar páginas de serviços');
  });
});
