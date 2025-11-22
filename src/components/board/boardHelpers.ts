import { DEBUG, SETTINGS, EJewelState, EJewelType } from "../../types/constants";
import type { LevelData } from "../../types/levelData";
import type { BoxData } from "../../types/boxData";
import { getJewelFrequency, getRandomJewelType } from "../Jewel/jewelHelpers";

export const START_COL = Math.floor(SETTINGS.COLS / 2);
export const START_ROW = SETTINGS.ROWS - SETTINGS.PIECE_SIZE;

export function generateNewPiece(startId: React.RefObject<number>, level: LevelData, forceJewelBox: boolean): BoxData[] {
  const piece: BoxData[] = [];

  for (let i = 0; i < SETTINGS.PIECE_SIZE; i++) {  
    piece.push({
      id: startId.current++,
      row: START_ROW + i,
      col: START_COL,
      jewel: {
        type: forceJewelBox
          ? EJewelType.JEWELBOX
          : getRandomJewelType(level.jewelFrequency),
        state: EJewelState.DIRTY
      }
    });
  }

  // if any single jewel is a JEWELBOX, make all jewels in this piece a JEWELBOX
  if (piece.some((box) => box.jewel.type === EJewelType.JEWELBOX) && !DEBUG.COLORS) {
    piece.forEach((box) => box.jewel.type = EJewelType.JEWELBOX);
  }

  return piece;
}

export function generateEmptyBoard(): BoxData[][] {
  return Array.from({ length: SETTINGS.COLS }, () => []);
}

export function getLevelData(score: number): LevelData {
  const level = Math.floor(score / 10000);
  const levelData = {
    level: level,
    speed: DEBUG.SPEED ? 300 : Math.max(900 - (level * 50), 300),
    jewelFrequency: getJewelFrequency(level)
  };

  return levelData;
}
