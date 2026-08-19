import { ChevronDown } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';

type Props = { kicker: string; title: string; description?: string; children: ReactNode; className?: string; sectionId?: string };
type DockContextValue = { activeId: string | null; setActiveId: (id: string | null) => void };
const DockContext = createContext<DockContextValue | null>(null);

export function CollapsibleDock({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  return <DockContext.Provider value={{ activeId, setActiveId }}>{children}</DockContext.Provider>;
}

export default function CollapsibleSection({ kicker, title, description, children, className = '', sectionId = title }: Props) {
  const dock = useContext(DockContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = dock ? dock.activeId === sectionId : localOpen;
  const toggle = () => dock ? dock.setActiveId(open ? null : sectionId) : setLocalOpen((value) => !value);
  return <section className={`collapsible-section ${open ? 'is-open' : ''} ${className}`.trim()} aria-label={title}>
    <button className="collapsible-trigger" type="button" aria-expanded={open} onClick={toggle}>
      <span><span className="section-kicker">{kicker}</span><strong>{title}</strong>{description && <small>{description}</small>}</span>
      <ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && <div className="collapsible-content">{children}</div>}
  </section>;
}
