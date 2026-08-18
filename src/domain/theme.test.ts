import { describe, expect, it } from 'vitest';
import { nextTheme, readTheme, THEME_KEY } from './theme';

describe('theme preference', () => {
  it('alternates between dark and light and reads a valid saved value', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    localStorage.setItem(THEME_KEY, 'light');
    expect(readTheme()).toBe('light');
  });
});
