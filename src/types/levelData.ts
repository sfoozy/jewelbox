import { ECellType } from "./constants";

export type LevelData = {
  level: number;
  speed: number;
  cellFrequency: { [key in ECellType]: number }
};