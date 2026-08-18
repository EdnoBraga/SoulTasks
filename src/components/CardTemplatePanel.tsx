import { Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CardTemplate, CardTemplateRecurrence } from '../domain/types';

type Props = { templates: CardTemplate[]; onUse: (template: CardTemplate) => void; onCreate: (template: CardTemplate) => void; onDelete: (templateId: string) => void };

export default function CardTemplatePanel({ templates, onUse, onCreate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<CardTemplateRecurrence>('weekly');
  const [selectedId, setSelectedId] = useState('');

  const create = () => {
    if (!name.trim()) return;
    onCreate({ id: crypto.randomUUID(), name: name.trim(), description: description.trim(), priority: 'medium', labelIds: [], assigneeIds: [], checklist: [], recurrence });
    setName(''); setDescription(''); setOpen(false);
  };

  return <section className="template-panel" aria-label="Modelos de cards"><div className="template-panel-heading"><div><div className="section-kicker">biblioteca de fluxo</div><strong>Modelos recorrentes</strong><span>Crie tarefas repetitivas em poucos cliques.</span></div><button className="button secondary" onClick={() => setOpen((value) => !value)}>{open ? 'Fechar' : 'Novo modelo'}</button></div>{templates.length > 0 && <div className="template-actions"><select aria-label="Selecionar modelo" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Escolher modelo...</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.name} · {template.recurrence === 'weekly' ? 'semanal' : template.recurrence === 'monthly' ? 'mensal' : 'sem recorrência'}</option>)}</select><button className="button primary" disabled={!selectedId} onClick={() => { const template = templates.find((item) => item.id === selectedId); if (template) onUse(template); }}>Usar modelo</button><button className="icon-button ghost" disabled={!selectedId} aria-label="Excluir modelo" onClick={() => { if (selectedId) { onDelete(selectedId); setSelectedId(''); } }}><Trash2 size={15} /></button></div>}{open && <div className="template-form"><label className="field"><span>Nome do modelo</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Revisão semanal do site" /></label><label className="field"><span>Descrição</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="O que esta tarefa recorrente deve lembrar?" /></label><label className="field"><span>Recorrência</span><select value={recurrence} onChange={(event) => setRecurrence(event.target.value as CardTemplateRecurrence)}><option value="weekly">Toda semana</option><option value="monthly">Todo mês</option><option value="none">Sem recorrência</option></select></label><button className="button primary" disabled={!name.trim()} onClick={create}><Check size={15} /> Salvar modelo</button></div>}</section>;
}
