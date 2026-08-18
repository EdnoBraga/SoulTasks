export const BOARD_ZOOM_MIN = 80;
export const BOARD_ZOOM_MAX = 100;
export type BoardZoom = number;

export function normalizeBoardZoom(value: string | null): BoardZoom {
  if (value === null) return BOARD_ZOOM_MAX;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(BOARD_ZOOM_MAX, Math.max(BOARD_ZOOM_MIN, parsed)) : BOARD_ZOOM_MAX;
}
