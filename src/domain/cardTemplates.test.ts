import { describe, expect, it } from 'vitest';
import { applyCardTemplate, cardToTemplate } from './cardTemplates';
import type { Card } from './types';

const card: Card = { id: 'card', columnId: 'todo', title: 'Relatório mensal', description: 'Consolidar dados', priority: 'high', labelIds: ['data'], assigneeIds: ['braga'], checklist: [{ id: 'check', text: 'Revisar números', done: true }], comments: ['não copiar'], createdAt: '2026-08-18' };

describe('card templates', () => {
  it('converte um card em modelo sem carregar comentários ou checklist concluído', () => {
    const template = cardToTemplate(card, 'Relatório mensal', 'monthly');
    expect(template.name).toBe('Relatório mensal');
    expect(template.checklist[0]?.done).toBe(false);
    expect(template.recurrence).toBe('monthly');
    expect(template).not.toHaveProperty('comments');
  });

  it('cria um novo card a partir de um modelo e calcula o próximo prazo', () => {
    const template = cardToTemplate(card, 'Relatório mensal', 'weekly');
    const result = applyCardTemplate(template, 'todo', new Date('2026-08-18T12:00:00.000Z'));
    expect(result.id).not.toBe(card.id);
    expect(result.columnId).toBe('todo');
    expect(result.dueDate).toBe('2026-08-25');
    expect(result.comments).toEqual([]);
  });
});
