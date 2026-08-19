import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CollapsibleSection, { CollapsibleDock } from './CollapsibleSection';

describe('CollapsibleSection', () => {
  it('starts closed and toggles its content when clicked', () => {
    render(<CollapsibleSection kicker="equipe interna" title="Membros"><p>Braga</p></CollapsibleSection>);
    const trigger = screen.getByRole('button', { name: /equipe interna membros/i });
    expect(screen.queryByText('Braga')).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByText('Braga')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(trigger);
    expect(screen.queryByText('Braga')).toBeNull();
  });

  it('keeps a single section open inside the dock', () => {
    render(<CollapsibleDock><CollapsibleSection sectionId="members" kicker="equipe interna" title="Membros"><p>Braga</p></CollapsibleSection><CollapsibleSection sectionId="call" kicker="sala de equipe" title="Videochamada"><p>Sala aberta</p></CollapsibleSection></CollapsibleDock>);
    fireEvent.click(screen.getByRole('button', { name: /equipe interna membros/i }));
    expect(screen.getByText('Braga')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /sala de equipe videochamada/i }));
    expect(screen.queryByText('Braga')).toBeNull();
    expect(screen.getByText('Sala aberta')).toBeTruthy();
  });
});
