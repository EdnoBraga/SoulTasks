import type { BoardState } from '../domain/types';
import { normalizeBoardState } from '../domain/stateNormalization';

const KEY = 'soulboard-state-v1';

export function loadState(): BoardState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeBoardState(JSON.parse(raw) as BoardState) : null;
  } catch { return null; }
}

export function saveState(state: BoardState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
