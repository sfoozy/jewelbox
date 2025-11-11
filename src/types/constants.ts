export const UNIT = 30;
export const ROWS = 15;
export const COLS = 7;
export const PIECE_SIZE = 3;
export const MATCH_SIZE = 3
export const MATCH_DELAY = 500;

export enum EGameState {
  NONE,
  STARTING,
 STARTED,
  PAUSED,
  ENDED
}

export enum ECellState {
  CLEAN,
  DIRTY,
  MATCHED
}

export enum ECellType {
  ULTRA_COMMON_1, // red
  ULTRA_COMMON_2, // amber
  ULTRA_COMMON_3, // lime
  ULTRA_COMMON_4, // gray
  ULTRA_COMMON_5, // green
  COMMON_1, // cyan
  COMMON_2, // blue
  COMMON_3, // fuchsia
  RARE_1, // light-pink
  RARE_2, // light-emerald
  ULTRA_RARE_1, // light-stone (off-white)
  JEWELBOX // WILD
}
