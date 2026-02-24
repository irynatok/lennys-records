/**
 * Grid layout constants - single source of truth
 */
export const GRID_LAYOUT = {
  COLS: 20,
  CARD_W: 280,
  CARD_H: 200,
  H_GAP: 40,
  V_GAP: 40,
  MARGIN: 60,
  DEFAULT_SCALE: 0.5,
} as const;

export const CELL_WIDTH = GRID_LAYOUT.CARD_W + GRID_LAYOUT.H_GAP;
export const CELL_HEIGHT = GRID_LAYOUT.CARD_H + GRID_LAYOUT.V_GAP;
