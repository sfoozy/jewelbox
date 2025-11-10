import type { ECellState, ECellType } from "./constants";

export type CellData = {
  id: number,
  row: number,
  col: number,
  state: ECellState,
  type: ECellType
};
