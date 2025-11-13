import { DEBUG, SETTINGS, EJewelState, EJewelType } from "../../types/constants";
import type { LevelData } from "../../types/levelData";
import type { BoxData } from "../../types/boxData";

export const START_COL = Math.floor(SETTINGS.COLS / 2);
export const START_ROW = SETTINGS.ROWS - SETTINGS.PIECE_SIZE;
let jewelCounter = 0;

export function getRandomJewelType(levelData: LevelData): EJewelType {
  if (DEBUG.COLORS) {
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
  for (let i = 0; i < SETTINGS.PIECE_SIZE; i++) {  
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
  if (piece.some(b => b.jewel.type === EJewelType.JEWELBOX) && !DEBUG.COLORS) {
    piece.forEach(b => b.jewel.type = EJewelType.JEWELBOX);
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
      [EJewelType.RARE_1]: level > 5 ? 150 : 100,
      [EJewelType.RARE_2]: level > 7 ? 150 : 0,
      [EJewelType.LUXE_1]: level > 9 ? 100 : 0,
      [EJewelType.JEWELBOX]: 0,
    }
  };

  const totalFreq = Object.values(levelData.jewelFrequency).reduce((total, freq) => total + freq);
  levelData.jewelFrequency[EJewelType.JEWELBOX] = Math.floor(totalFreq * SETTINGS.JEWELBOX_FREQUENCY);
  return levelData;
}
