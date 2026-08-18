import { Download, FileDown, FileText } from 'lucide-react';
import { useState } from 'react';
import type { Board } from '../domain/types';

export default function ExportMenu({ boards, onExportCsv, onExportPdf }: { boards: Board[]; onExportCsv: () => void; onExportPdf: () => void }) {
  const [open, setOpen] = useState(false);
  return <div className="export-menu"><button className="button secondary" aria-expanded={open} aria-label="Exportar" onClick={() => setOpen((value) => !value)}><Download size={15} /> Exportar</button>{open && <div className="export-options" role="menu"><button role="menuitem" onClick={() => { setOpen(false); onExportCsv(); }}><FileText size={14} /> Baixar CSV</button><button role="menuitem" onClick={() => { setOpen(false); onExportPdf(); }}><FileDown size={14} /> Imprimir / PDF</button><small>{boards.length} workflow{boards.length === 1 ? '' : 's'} selecionado{boards.length === 1 ? '' : 's'}</small></div>}</div>;
}
