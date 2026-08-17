import type { BoardState, Card, Column } from './types';

const now = new Date().toISOString();
const columns: Column[] = [
  { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: 'Ideias e próximas ações', complete: false },
  { id: 'doing', name: 'Em andamento', color: '#63D9FF', icon: '◒', description: 'O que está recebendo energia agora', complete: false },
  { id: 'review', name: 'Revisão', color: '#A78BFA', icon: '◌', description: 'Quase pronto para sair', complete: false },
  { id: 'done', name: 'Concluído', color: '#8FD41F', icon: '✓', description: 'Feito e acompanhado', complete: true },
];

const cards: Card[] = [
  { id: 'card-1', columnId: 'todo', title: 'Mapear os próximos conteúdos da SoulFork', description: 'Escolher os temas que viram artigos e Reels nesta semana.', priority: 'high', labelIds: ['content'], checklist: [], comments: [], createdAt: now },
  { id: 'card-2', columnId: 'todo', title: 'Revisar páginas de serviços', description: '', priority: 'medium', labelIds: ['site'], dueDate: '2026-08-21', checklist: [{ id: 'c1', text: 'Conferir CTA', done: true }, { id: 'c2', text: 'Validar links', done: false }], comments: [], createdAt: now },
  { id: 'card-3', columnId: 'doing', title: 'Criar fluxo de triagem no WhatsApp', description: 'Organizar entrada, classificação e próximo passo do contato.', priority: 'high', labelIds: ['automation'], checklist: [], comments: ['Definir campos mínimos antes de automatizar.'], createdAt: now },
  { id: 'card-4', columnId: 'review', title: 'Dashboard de operação digital', description: 'Versão inicial para acompanhar leads, atendimento e tarefas.', priority: 'medium', labelIds: ['data'], dueDate: '2026-08-24', checklist: [], comments: [], createdAt: now },
  { id: 'card-5', columnId: 'done', title: 'Definir identidade cromática', description: 'Paleta escura com ciano, violeta e verde de confirmação.', priority: 'low', labelIds: ['design'], checklist: [], comments: [], createdAt: now },
];

export function createDemoState(): BoardState {
  return {
    activeBoardId: 'main',
    boards: { main: { id: 'main', name: 'Operação SoulFork', description: 'Transformando tarefas soltas em fluxo claro.', columnIds: columns.map((column) => column.id), columns: Object.fromEntries(columns.map((column) => [column.id, column])), cards: Object.fromEntries(cards.map((card) => [card.id, card])) } },
    inbox: [
      { id: 'inbox-1', title: 'Ideia: checklist de diagnóstico gratuito', description: 'Capturada na Inbox para organizar depois.', createdAt: now },
      { id: 'inbox-2', title: 'Perguntar sobre integração com calendário', description: '', createdAt: now },
    ],
    labels: [
      { id: 'content', name: 'Conteúdo', color: '#63D9FF' },
      { id: 'site', name: 'Site', color: '#5B8CFF' },
      { id: 'automation', name: 'Automação', color: '#A78BFA' },
      { id: 'data', name: 'Dados', color: '#8FD41F' },
      { id: 'design', name: 'Design', color: '#F6B3FF' },
    ],
  };
}
