import type { Board } from './types';
import { SOULFORK_ASSIGNEES } from './assignees';

const priorityText = { low: 'Baixa', medium: 'Média', high: 'Alta' } as const;

function csvCell(value: string) { return `"${value.replace(/"/g, '""')}"`; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character); }
function formatDate(value?: string) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : ''; }

export function buildTasksCsv(boards: Board[]) {
  const lines = ['\ufeffWorkflow,Coluna,Tarefa,Descrição,Prioridade,Responsáveis,Prazo,Status'];
  boards.flatMap((board) => Object.values(board.cards).map((card) => {
    const column = board.columns[card.columnId];
    const assignees = (card.assigneeIds ?? []).map((id) => SOULFORK_ASSIGNEES.find((assignee) => assignee.id === id)?.name ?? id).join(', ');
    return [board.name, column?.name ?? 'Sem coluna', card.title, card.description, priorityText[card.priority], assignees, formatDate(card.dueDate), column?.complete ? 'Concluído' : 'Em andamento'].map(csvCell).join(';');
  })).forEach((line) => lines.push(line));
  return lines.join('\r\n');
}

export function buildPrintableTasksHtml(boards: Board[]) {
  const sections = boards.map((board) => `<section><h2>Workflow: ${escapeHtml(board.name)}</h2><p>${escapeHtml(board.description)}</p><table><thead><tr><th>Tarefa</th><th>Coluna</th><th>Prioridade</th><th>Responsáveis</th><th>Prazo</th></tr></thead><tbody>${Object.values(board.cards).map((card) => { const column = board.columns[card.columnId]; const assignees = (card.assigneeIds ?? []).map((id) => SOULFORK_ASSIGNEES.find((assignee) => assignee.id === id)?.name ?? id).join(', '); return `<tr><td>${escapeHtml(card.title)}<small>${escapeHtml(card.description)}</small></td><td>${escapeHtml(column?.name ?? 'Sem coluna')}</td><td>${priorityText[card.priority]}</td><td>${escapeHtml(assignees || 'Sem responsável')}</td><td>${formatDate(card.dueDate) || 'Sem prazo'}</td></tr>`; }).join('')}</tbody></table></section>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Exportação SoulTasks</title><style>body{font-family:Arial,sans-serif;color:#17213d;margin:32px}h1{margin-bottom:4px}h2{margin-top:28px;color:#315fd4}p{color:#52618b}table{border-collapse:collapse;width:100%;margin-top:12px}th,td{border:1px solid #d7deed;padding:9px;text-align:left;vertical-align:top}th{background:#eef2fa}small{display:block;color:#52618b;margin-top:4px}@media print{body{margin:12mm}section{break-inside:avoid}}</style></head><body><h1>Exportação SoulTasks</h1><p>Gerado em ${escapeHtml(new Date().toLocaleString('pt-BR'))}</p>${sections}</body></html>`;
}
