import type { BoardState } from '../domain/types';

const KEY = 'soulboard-state-v1';

export function loadState(): BoardState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as BoardState : null;
  } catch { return null; }
}

export function saveState(state: BoardState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
