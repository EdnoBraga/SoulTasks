import type { Board, BoardState, Card } from '../domain/types';

export default function ActivityTimeline({ state, board, onOpenCard }: { state: BoardState; board: Board; onOpenCard: (card: Card) => void }) {
  const cards = Object.values(board.cards);
  const creationItems = cards.map((card) => ({ id: `${card.id}-created`, date: card.createdAt, title: card.title, detail: 'Card disponível no quadro', card }));
  const historyItems = cards.flatMap((card) => (card.history ?? []).map((entry) => ({ id: entry.id, date: entry.createdAt, title: card.title, detail: `${entry.author} ${entry.summary}`, card })));
  const inboxItems = state.inbox.map((item) => ({ id: item.id, date: item.createdAt, title: item.title, detail: 'Captura adicionada à Inbox', card: undefined }));
  const items = [...creationItems, ...historyItems, ...inboxItems].sort((a, b) => b.date.localeCompare(a.date));
  return <div className="view-panel"><div className="view-heading"><div><div className="section-kicker">linha do tempo</div><h1>Atividade</h1><p>Veja quem alterou cada card e quando.</p></div><span className="view-count">{items.length} eventos</span></div>{items.length ? <div className="activity-list">{items.map((item) => <article className="activity-item" key={item.id}><span className="activity-dot" /><div><strong>{item.title}</strong><p>{item.detail} · {new Date(item.date).toLocaleString('pt-BR')}</p></div>{item.card && <button className="text-action" onClick={() => onOpenCard(item.card)}>Abrir card</button>}</article>)}</div> : <div className="empty-view"><h2>Nenhuma atividade ainda</h2><p>Crie um card ou capture uma ideia para começar a acompanhar o fluxo.</p></div>}</div>;
}
