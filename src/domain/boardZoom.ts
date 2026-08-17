export const BOARD_ZOOM_LEVELS = [80, 90, 100] as const;
export type BoardZoom = (typeof BOARD_ZOOM_LEVELS)[number];

export function normalizeBoardZoom(value: string | null): BoardZoom {
  const parsed = Number(value);
  return BOARD_ZOOM_LEVELS.includes(parsed as BoardZoom) ? parsed as BoardZoom : 100;
}
