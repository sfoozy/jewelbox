export const DEBUG = {
  COLORS: false,
  LEVELS: false,
  SPEED: false,
}

export const SETTINGS = {
  UNIT: 40,
  ROWS: 15,
  COLS: 7,
  STARTING_LIVES: 3,
  PIECE_SIZE: 3,
  MATCH_SIZE: 3,
  MATCH_DELAY: 400,
  NEW_LIFE_DELAY: 1000
}

export enum EGameState {
  NONE,
  STARTING,
  STARTED,
  PAUSED,
  ENDED
}

export enum EJewelState {
  CLEAN,
  DIRTY,
  MATCHED
}

export enum EJewelType {
  COMMON_1, // red
  COMMON_2, // amber
  COMMON_3, // lime
  COMMON_4, // stone
  COMMON_5, // cyan
  VALUE_1, // green
  VALUE_2, // blue
  VALUE_3, // fuchsia
  RARE_1, // teal-violet
  RARE_2, // violet-orange
  LUXE_1, // red-emerald
  JEWELBOX // WILD
}
