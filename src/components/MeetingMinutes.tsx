import { CalendarDays, Download, FileText, Printer, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MeetingMinute } from '../collaboration/meetingMinutes';
import { deleteMeetingMinute, downloadMinuteHtml } from '../collaboration/meetingMinutes';

type Props = { minutes: MeetingMinute[]; canDelete: boolean; onDelete?: (minuteId: string) => Promise<void> };

export default function MeetingMinutes({ minutes, canDelete, onDelete }: Props) {
  const [selectedId, setSelectedId] = useState(minutes[0]?.id);
  const [error, setError] = useState('');
  useEffect(() => { if (!minutes.some((minute) => minute.id === selectedId)) setSelectedId(minutes[0]?.id); }, [minutes, selectedId]);
  const active = minutes.find((minute) => minute.id === selectedId) ?? minutes[0];
  const removeActive = async () => {
    if (!canDelete || !active || !window.confirm('Excluir esta ata permanentemente?')) return;
    setError('');
    try { if (onDelete) await onDelete(active.id); else deleteMeetingMinute(active.id); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Não foi possível excluir a ata.'); }
  };
  return <div className="view-panel minutes-panel"><div className="view-heading"><div><div className="section-kicker">memória do workspace</div><h1>Atas de reuniões</h1><p>Resumos organizados por reunião, com participantes, decisões e próximos passos.</p></div><span className="view-count">{minutes.length} atas</span></div>{error && <p className="call-error" role="alert">{error}</p>}{active ? <div className="minutes-layout"><aside className="minutes-list">{minutes.map((minute) => <button className={minute.id === active.id ? 'active' : ''} key={minute.id} onClick={() => setSelectedId(minute.id)}><FileText size={16} /><span>{minute.title}<small>{new Date(minute.startedAt).toLocaleDateString('pt-BR')}</small></span></button>)}</aside><article className="minute-document"><div className="minute-actions"><button className="button secondary" onClick={() => downloadMinuteHtml(active)}><Download size={15} /> HTML</button><button className="button secondary" onClick={() => window.print()}><Printer size={15} /> PDF / imprimir</button>{canDelete && <button className="danger-button" onClick={() => void removeActive()}><Trash2 size={14} /> Excluir ata</button>}</div><h2>{active.title}</h2><p className="minute-meta"><CalendarDays size={15} /> {new Date(active.startedAt).toLocaleString('pt-BR')} · {active.participants.join(', ')}</p><h3>Resumo por participante</h3>{active.sections.map((section) => <p className="minute-section" key={`${section.speaker}-${section.text}`}><strong>{section.speaker}</strong>{section.text}</p>)}<div className="minute-columns"><div><h3>Decisões</h3><ul>{active.decisions.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Próximos passos</h3><ul>{active.nextSteps.map((item) => <li key={item}>{item}</li>)}</ul></div></div></article></div> : <div className="empty-view"><FileText size={28} /><h2>Nenhuma ata ainda</h2><p>Quando uma reunião for encerrada, o resumo aparecerá aqui para consulta e exportação.</p></div>}</div>;
}
