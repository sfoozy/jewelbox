export const UNIT = 30;
export const ROWS = 15;
export const COLS = 7;
export const PIECE_SIZE = 3;
export const MATCH_SIZE = 3
export const SPEED = 800;
export const DELAY = 1000;

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
  RED,
  AMBER,
  LIME,
  SKY,
  VIOLET,
  FUCHSIA,
  WHITE
}
