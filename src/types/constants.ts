export const DEBUG = false;
export const DEBUG_COLORS = false;
export const DEBUG_LEVELS = false;

export const UNIT = 40;
export const ROWS = 15;
export const COLS = 7;
export const STARTING_LIVES = 3;
export const PIECE_SIZE = 3;
export const MATCH_SIZE = 3;
export const MATCH_DELAY = 500;
export const NEW_LIFE_DELAY = 1000;

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
  RARE_1, // teal-violet
  RARE_2, // pink-orange
  ULTRA_RARE_1, // red-emerald
  JEWELBOX // WILD
}
