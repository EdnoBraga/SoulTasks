import { AlertTriangle, BarChart3, Users } from 'lucide-react';
import { getCardAttention } from '../domain/cardAttention';
import { SOULFORK_ASSIGNEES } from '../domain/assignees';
import type { Board } from '../domain/types';
import CollapsibleSection from './CollapsibleSection';

type DashboardOverviewProps = { boards: Board[]; now?: Date };

export default function DashboardOverview({ boards, now = new Date() }: DashboardOverviewProps) {
  const cards = boards.flatMap((board) => Object.values(board.cards).map((card) => ({ card, board }))).filter(({ card }, index, all) => all.findIndex((item) => item.card.id === card.id) === index);
  const overdue = cards.filter(({ card, board }) => getCardAttention(card, Boolean(board.columns[card.columnId]?.complete), now).overdue).length;
  const unassigned = cards.filter(({ card }) => card.assigneeIds.length === 0).length;
  const departments = boards.filter((board) => board.id !== 'main');
  return <CollapsibleSection sectionId="dashboard" kicker="painel inicial" title="Visão da operação" description="Carga, atenção e progresso por departamento" className="dashboard-overview"><div className="dashboard-overview-grid"><div className="workload-panel"><h3><Users size={16} /> Carga da equipe</h3><div className="workload-list">{SOULFORK_ASSIGNEES.map((assignee) => { const total = cards.filter(({ card }) => card.assigneeIds.includes(assignee.id)).length; return <div className="workload-row" key={assignee.id}><span>{assignee.name}</span><div className="workload-track"><i style={{ width: `${Math.min(100, total * 22)}%` }} /></div><strong>{total} {total === 1 ? 'tarefa' : 'tarefas'}</strong></div>; })}</div></div><div className="attention-panel"><h3><AlertTriangle size={16} /> Atenção</h3><div className="attention-stats"><span><strong>{overdue}</strong>{overdue === 1 ? ' atrasada' : ' atrasadas'}</span><span><strong>{unassigned}</strong>{unassigned === 1 ? ' sem responsável' : ' sem responsáveis'}</span></div></div></div>{departments.length > 0 && <div className="department-progress"><h3>Progresso por departamento</h3><div className="department-grid">{departments.map((department) => { const departmentCards = Object.values(department.cards); const done = departmentCards.filter((card) => department.columns[card.columnId]?.complete).length; const progress = departmentCards.length ? Math.round((done / departmentCards.length) * 100) : 0; return <div className="department-card" key={department.id}><div><strong>{department.name}</strong><span>{done}/{departmentCards.length} concluídas</span></div><b>{progress}%</b><div className="department-track"><i style={{ width: `${progress}%` }} /></div></div>; })}</div></div>}</CollapsibleSection>;
}
