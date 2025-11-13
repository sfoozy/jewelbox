import { EJewelType } from "./constants";

export type LevelData = {
  level: number;
  speed: number;
  jewelFrequency: { [key in EJewelType]: number }
};