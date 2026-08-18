import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CollapsibleSection from './CollapsibleSection';

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
});
