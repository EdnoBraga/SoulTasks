import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { addDays, getWeekStart, toDateKey } from '../domain/calendar';
import type { Board, Card } from '../domain/types';

type Props = { board: Board; onOpenCard: (card: Card) => void; onUpdateCard: (card: Card) => void; onCreateCard: (date: string) => void };
const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function CalendarWorkspace({ board, onOpenCard, onUpdateCard, onCreateCard }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dragOver, setDragOver] = useState('');
  const days = useMemo(() => dayNames.map((label, index) => ({ label, date: addDays(weekStart, index), key: toDateKey(addDays(weekStart, index)) })), [weekStart]);
  const cards = Object.values(board.cards).filter((card) => card.dueDate);
  const monthLabel = weekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return <div className="calendar-workspace"><div className="calendar-workspace-head"><div><div className="section-kicker">agenda operacional</div><h1>Calendário</h1><p>Arraste um card para outro dia para atualizar o prazo.</p></div><div className="calendar-controls"><button className="icon-button" aria-label="Semana anterior" onClick={() => setWeekStart((date) => addDays(date, -7))}><ChevronLeft size={17} /></button><button className="button secondary" onClick={() => setWeekStart(getWeekStart(new Date()))}>Hoje</button><strong>{monthLabel}</strong><button className="icon-button" aria-label="Próxima semana" onClick={() => setWeekStart((date) => addDays(date, 7))}><ChevronRight size={17} /></button></div></div><div className="calendar-week" role="grid" aria-label="Calendário semanal">{days.map((day) => { const dayCards = cards.filter((card) => card.dueDate === day.key); return <section className={`calendar-day ${dragOver === day.key ? 'is-drop-target' : ''}`} key={day.key} role="gridcell" onDragOver={(event) => { event.preventDefault(); setDragOver(day.key); }} onDragLeave={() => setDragOver('')} onDrop={(event) => { event.preventDefault(); const cardId = event.dataTransfer.getData('cardId'); const card = cards.find((item) => item.id === cardId); if (card) onUpdateCard({ ...card, dueDate: day.key }); setDragOver(''); }}><div className="calendar-day-head"><span>{day.label}</span><strong>{day.date.getDate()}</strong></div><div className="calendar-day-cards">{dayCards.map((card) => <button className="calendar-task" draggable key={card.id} onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('cardId', card.id); }} onClick={() => onOpenCard(card)}><strong>{card.title}</strong><small>{board.columns[card.columnId]?.name ?? 'Sem coluna'}</small></button>)}<button className="calendar-add" onClick={() => onCreateCard(day.key)}><Plus size={14} /> Adicionar</button></div></section>; })}</div></div>;
}
