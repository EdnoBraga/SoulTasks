import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Props = { kicker: string; title: string; description?: string; children: ReactNode; className?: string };

export default function CollapsibleSection({ kicker, title, description, children, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  return <section className={`collapsible-section ${open ? 'is-open' : ''} ${className}`.trim()} aria-label={title}>
    <button className="collapsible-trigger" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span><span className="section-kicker">{kicker}</span><strong>{title}</strong>{description && <small>{description}</small>}</span>
      <ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && <div className="collapsible-content">{children}</div>}
  </section>;
}
