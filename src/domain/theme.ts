export type Theme = 'dark' | 'light';
export const THEME_KEY = 'soultasks-theme-v1';

export function nextTheme(theme: Theme): Theme { return theme === 'dark' ? 'light' : 'dark'; }

export function readTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
}
