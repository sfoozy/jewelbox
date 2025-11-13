import type { JewelData } from "../../types/jewelData";
import { COLS, DEBUG_COLORS, DEBUG_LEVELS, EJewelState, EJewelType, JEWELBOX_FREQUENCY, PIECE_SIZE, ROWS } from "../../types/constants";
import type { LevelData } from "../../types/levelData";
import type { BoxData } from "../../types/boxData";
import Jewel from "../jewel/Jewel";

export const START_COL = Math.floor(COLS / 2);
export const START_ROW = ROWS - PIECE_SIZE;
let jewelCounter = 0;

export function getRandomJewelType(levelData: LevelData): EJewelType {
  if (DEBUG_COLORS) {
    return (jewelCounter - 1) % (Object.keys(EJewelType).length / 2)
  }
  
  const choices: string[] = [];
  Object.entries(levelData.jewelFrequency).forEach(([type, freq]: [string, number]) => {
    for (let i = 0; i < freq; i++) {
      choices.push(type);
    }
  });

  const rand = Math.floor(Math.random() * choices.length);
  return Number(choices[rand]);
}

export function generateNewPiece(score: number, startCol: number): BoxData[] {
  const piece: BoxData[] = [];

  const levelData = getLevelData(score);
  for (let i = 0; i < PIECE_SIZE; i++) {  
    piece.push({
      id: jewelCounter++,
      row: START_ROW + i,
      col: startCol,
      jewel: {
        type: getRandomJewelType(levelData),
        state: EJewelState.DIRTY,
      }
    });
  }

  // if any single jewel is a JEWELBOX, make all jewels in this piece a JEWELBOX
  if (piece.some(b => b.jewel.type === EJewelType.JEWELBOX) && !DEBUG_COLORS) {
    piece.forEach(b => b.jewel.type = EJewelType.JEWELBOX);
  }

  return piece;
}

export function generateEmptyBoard(): BoxData[][] {
  return Array.from({ length: COLS }, () => []);
}

export function getLevelData(score: number): LevelData {
  const level = Math.floor(score / 10000);
  const levelData = {
    level: level,
    speed: Math.max(800 - (level * 50), 200),
    jewelFrequency: {
      [EJewelType.COMMON_1]: 400,
      [EJewelType.COMMON_2]: 400,
      [EJewelType.COMMON_3]: 400,
      [EJewelType.COMMON_4]: level > 5 ? 0 : 400,
      [EJewelType.COMMON_5]: level > 3 ? 400 : 0,
      [EJewelType.VALUE_1]: 300,
      [EJewelType.VALUE_2]: level > 1 ? 300 : 0,
      [EJewelType.VALUE_3]: level > 5 ? 300 : 0,
      [EJewelType.RARE_1]: level > 5 ? 200 : 100,
      [EJewelType.RARE_2]: level > 7 ? 200 : 0,
      [EJewelType.LUX_1]: level > 9 ? 100 : 0,
      [EJewelType.JEWELBOX]: 0,
    }
  };

  const totalFreq = Object.values(levelData.jewelFrequency).reduce((total, freq) => total + freq);
  levelData.jewelFrequency[EJewelType.JEWELBOX] = Math.floor(totalFreq * JEWELBOX_FREQUENCY);
  return levelData;
}
