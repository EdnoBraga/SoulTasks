import { AtSign, Check } from 'lucide-react';
import { useState } from 'react';
import CardModal from './CardModal';
import { mentionSuggestions } from '../domain/mentions';
import type { Card, CardTemplate, CardTemplateRecurrence, Column, Label } from '../domain/types';

type Props = { card: Card; columns: Column[]; labels: Label[]; templates: CardTemplate[]; onApplyTemplate: (template: CardTemplate) => void; onSaveTemplate: (card: Card, name: string, recurrence: CardTemplateRecurrence) => void; onClose: () => void; onSave: (card: Card) => void; onDelete: () => void; onDuplicate: () => void };

export default function CardModalWithMentions(props: Props) {
  const [text, setText] = useState('');
  const suggestions = mentionSuggestions(text);
  const addMention = (name: string) => setText((current) => `${current.replace(/@[\p{L}]*$/u, '').trimEnd()}${current.trim() ? ' ' : ''}@${name} `);
  const addComment = () => { if (!text.trim()) return; props.onSave({ ...props.card, comments: [...props.card.comments, text.trim()] }); props.onClose(); };
  return <><CardModal {...props} /><aside className="mentions-panel" aria-label="Comentários com menções"><div className="mentions-panel-head"><div><div className="section-kicker">colaboração</div><h2>Comentários</h2></div><AtSign size={18} /></div><p>Use <strong>@Braga</strong>, <strong>@Pallus</strong> ou <strong>@Kayo</strong> para indicar alguém.</p><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Escreva um comentário com @menção..." rows={4} aria-label="Novo comentário com menção" />{suggestions.length > 0 && <div className="mention-suggestions" role="listbox">{suggestions.map((assignee) => <button key={assignee.id} onClick={() => addMention(assignee.name)}><span>@{assignee.name}</span><small>mencionar integrante</small></button>)}</div>}<button className="button primary" disabled={!text.trim()} onClick={addComment}><Check size={15} /> Adicionar comentário</button></aside></>;
}
