import { useEffect, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { BOARD_ZOOM_MAX, BOARD_ZOOM_MIN, normalizeBoardZoom, type BoardZoom } from '../domain/boardZoom';
import { SOULFORK_ASSIGNEES } from '../domain/assignees';
import type { Priority } from '../domain/types';

type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'none';
type QuickFilters = { assigneeId: string; labelId: string; due: DueFilter; priority: Priority | 'all' };

const EMPTY_FILTERS: QuickFilters = { assigneeId: 'all', labelId: 'all', due: 'all', priority: 'all' };
const LABELS = [
  { id: 'content', name: 'Conteúdo' },
  { id: 'site', name: 'Site' },
  { id: 'automation', name: 'Automação' },
  { id: 'data', name: 'Dados' },
  { id: 'design', name: 'Design' },
];

export default function BoardNavigation() {
  const [zoom, setZoom] = useState<BoardZoom>(() => normalizeBoardZoom(localStorage.getItem('soultasks-board-zoom')));
  const [filters, setFilters] = useState<QuickFilters>(EMPTY_FILTERS);

  useEffect(() => {
    localStorage.setItem('soultasks-board-zoom', String(zoom));
    const canvas = document.querySelector<HTMLDivElement>('.board-canvas');
    const columns = canvas?.querySelector<HTMLElement>('.columns-row');
    if (!canvas || !columns) return;
    columns.style.zoom = String(zoom / 100);
    const shiftScroll = (event: WheelEvent) => { if (event.shiftKey) { event.preventDefault(); canvas.scrollLeft += event.deltaY; } };
    let dragStart: { x: number; scrollLeft: number } | null = null;
    const pointerDown = (event: PointerEvent) => { if (event.target !== event.currentTarget) return; dragStart = { x: event.clientX, scrollLeft: canvas.scrollLeft }; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-panning'); };
    const pointerMove = (event: PointerEvent) => { if (dragStart) canvas.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x); };
    const pointerUp = () => { dragStart = null; canvas.classList.remove('is-panning'); };
    canvas.addEventListener('wheel', shiftScroll, { passive: false }); canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp);
    return () => { canvas.removeEventListener('wheel', shiftScroll); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerUp); };
  }, [zoom]);

  const updateFilter = <K extends keyof QuickFilters>(key: K, value: QuickFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    window.dispatchEvent(new CustomEvent<QuickFilters>('soultasks:quick-filters', { detail: next }));
  };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); window.dispatchEvent(new CustomEvent<QuickFilters>('soultasks:quick-filters', { detail: EMPTY_FILTERS })); };
  const hasFilters = Object.values(filters).some((value) => value !== 'all');

  return <div className="board-navigation" aria-label="Filtros rápidos e navegação do quadro">
    <div className="quick-filter-title"><Filter size={14} /><span>Filtros rápidos</span></div>
    <select value={filters.assigneeId} onChange={(event) => updateFilter('assigneeId', event.target.value)} aria-label="Filtrar por responsável">
      <option value="all">Responsável: todos</option><option value="unassigned">Sem responsável</option>{SOULFORK_ASSIGNEES.map((assignee) => <option value={assignee.id} key={assignee.id}>{assignee.name}</option>)}
    </select>
    <select value={filters.labelId} onChange={(event) => updateFilter('labelId', event.target.value)} aria-label="Filtrar por etiqueta">
      <option value="all">Etiqueta: todas</option>{LABELS.map((label) => <option value={label.id} key={label.id}>{label.name}</option>)}
    </select>
    <select value={filters.due} onChange={(event) => updateFilter('due', event.target.value as DueFilter)} aria-label="Filtrar por prazo">
      <option value="all">Prazo: todos</option><option value="overdue">Atrasadas</option><option value="today">Hoje</option><option value="week">Esta semana</option><option value="none">Sem prazo</option>
    </select>
    <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value as Priority | 'all')} aria-label="Filtrar por prioridade">
      <option value="all">Prioridade: todas</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
    </select>
    {hasFilters && <button className="quick-filter-reset" onClick={resetFilters} aria-label="Limpar filtros rápidos" title="Limpar filtros rápidos"><RotateCcw size={14} /></button>}
    <span className="quick-filter-divider" aria-hidden="true" />
    <span>Zoom</span><input type="range" min={BOARD_ZOOM_MIN} max={BOARD_ZOOM_MAX} step="1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Ajustar zoom do quadro" /><output>{zoom}%</output><small>Shift + rolagem</small>
  </div>;
}
