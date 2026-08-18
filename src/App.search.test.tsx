import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Topbar } from './App';

describe('global search', () => {
  it('focuses the global search with Ctrl+K and exposes cards from all workflows', () => {
    render(<Topbar activeView="board" query="" onQuery={vi.fn()} searchSuggestions={['Card de Site', 'Ideia da Inbox']} onViewChange={vi.fn()} onNotify={vi.fn()} onChat={vi.fn()} onSignOut={vi.fn()} profile={{ displayName: 'Braga' }} onSettings={vi.fn()} />);
    window.dispatchEvent(new Event('soultasks:focus-search'));
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: /busca global/i }));
    const suggestions = [...document.querySelectorAll<HTMLSelectElement>('#soultasks-search-suggestions option')].map((option) => option.value);
    expect(suggestions).toEqual(['Card de Site', 'Ideia da Inbox']);
  });
});
