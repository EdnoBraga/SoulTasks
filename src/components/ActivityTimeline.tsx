import { useMemo, useState } from 'react';
import { buildActivityGroups } from '../domain/activity';
import type { Board, BoardState, Card } from '../domain/types';

export default function ActivityTimeline({ state, board, boards = [board], onOpenCard }: { state: BoardState; board: Board; boards?: Board[]; onOpenCard: (card: Card) => void }) {
  const groups = useMemo(() => buildActivityGroups(state, boards), [state, boards]);
  const [activeGroup, setActiveGroup] = useState('all');
  const visibleGroups = activeGroup === 'all' ? groups : groups.filter((group) => group.id === activeGroup);
  const items = visibleGroups.flatMap((group) => group.items);
  return <div className="view-panel"><div className="view-heading"><div><div className="section-kicker">linha do tempo</div><h1>Atividade</h1><p>Veja quem alterou cada card e quando, separado por setor.</p></div><span className="view-count">{items.length} eventos</span></div><div className="activity-sector-tabs" role="tablist" aria-label="Filtrar atividade por setor"><button className={activeGroup === 'all' ? 'active' : ''} role="tab" aria-selected={activeGroup === 'all'} onClick={() => setActiveGroup('all')}>Todos</button>{groups.map((group) => <button className={activeGroup === group.id ? 'active' : ''} role="tab" aria-selected={activeGroup === group.id} key={group.id} onClick={() => setActiveGroup(group.id)}>{group.name}</button>)}</div>{items.length ? <div className="activity-sector-groups">{visibleGroups.map((group) => <section key={group.id} className="activity-sector"><h2>{group.name}</h2><div className="activity-list">{group.items.map((item) => <article className="activity-item" key={item.id}><span className="activity-dot" /><div><strong>{item.title}</strong><p>{item.detail} · {new Date(item.date).toLocaleString('pt-BR')}</p></div>{item.card && <button className="text-action" onClick={() => onOpenCard(item.card!)}>Abrir card</button>}</article>)}</div></section>)}</div> : <div className="empty-view"><h2>Nenhuma atividade ainda</h2><p>Crie um card ou capture uma ideia para começar a acompanhar o fluxo.</p></div>}</div>;
}
