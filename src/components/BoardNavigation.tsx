import { useState } from 'react';
import { Filter, Moon, RotateCcw, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { SOULFORK_ASSIGNEES } from '../domain/assignees';
import type { Priority } from '../domain/types';
import { nextTheme, readTheme, saveTheme, type Theme } from '../domain/theme';

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
  const [filters, setFilters] = useState<QuickFilters>(EMPTY_FILTERS);
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  useEffect(() => { saveTheme(theme); }, [theme]);

  const updateFilter = <K extends keyof QuickFilters>(key: K, value: QuickFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    window.dispatchEvent(new CustomEvent<QuickFilters>('soultasks:quick-filters', { detail: next }));
  };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); window.dispatchEvent(new CustomEvent<QuickFilters>('soultasks:quick-filters', { detail: EMPTY_FILTERS })); };
  const applySavedFilter = (name: 'mine' | 'overdue' | 'week') => { const next = name === 'mine' ? { ...EMPTY_FILTERS, assigneeId: 'braga' } : name === 'overdue' ? { ...EMPTY_FILTERS, due: 'overdue' as const } : { ...EMPTY_FILTERS, due: 'week' as const }; setFilters(next); window.dispatchEvent(new CustomEvent<QuickFilters>('soultasks:quick-filters', { detail: next })); };
  const hasFilters = Object.values(filters).some((value) => value !== 'all');

  return <div className="board-navigation" aria-label="Filtros rápidos e navegação do quadro">
    <div className="quick-filter-title"><Filter size={14} /><span>Filtros rápidos</span></div><button className="theme-toggle" onClick={() => setTheme(nextTheme(theme))} aria-label={`Ativar modo ${theme === 'dark' ? 'claro' : 'escuro'}`} title={`Modo ${theme === 'dark' ? 'claro' : 'escuro'}`}>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}<span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span></button>
    <button className="saved-filter" onClick={() => applySavedFilter('mine')}>Minhas tarefas</button><button className="saved-filter" onClick={() => applySavedFilter('overdue')}>Atrasadas</button><button className="saved-filter" onClick={() => applySavedFilter('week')}>Esta semana</button>
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
  </div>;
}
