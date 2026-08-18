import { describe, expect, it } from 'vitest';
import { buildTasksCsv, buildPrintableTasksHtml } from './export';
import type { Board } from './types';

const board: Board = {
  id: 'site', name: 'Site', description: 'Workflow do site', columnIds: ['todo'],
  columns: { todo: { id: 'todo', name: 'A fazer', color: '#5B8CFF', icon: '✦', description: '', complete: false } },
  cards: { card: { id: 'card', columnId: 'todo', title: 'Revisar, homepage', description: 'Checar CTA', priority: 'high', labelIds: ['site'], assigneeIds: ['braga'], checklist: [], comments: [], createdAt: '2026-08-18', dueDate: '2026-08-20' } },
};

describe('task exports', () => {
  it('builds a CSV with escaped fields and workflow metadata', () => {
    const csv = buildTasksCsv([board]);
    expect(csv).toContain('\ufeffWorkflow,Coluna,Tarefa,Descrição,Prioridade,Responsáveis,Prazo,Status');
    expect(csv).toContain('"Site";"A fazer";"Revisar, homepage";"Checar CTA";"Alta";"Braga";"20/08/2026";"Em andamento"');
  });

  it('builds a printable HTML document with task titles', () => {
    const html = buildPrintableTasksHtml([board]);
    expect(html).toContain('<title>Exportação SoulTasks</title>');
    expect(html).toContain('Revisar, homepage');
    expect(html).toContain('Workflow: Site');
  });
});
