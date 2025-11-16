import { DEBUG, SETTINGS, EJewelState, EJewelType } from "../../types/constants";
import type { LevelData } from "../../types/levelData";
import type { BoxData } from "../../types/boxData";

export const START_COL = Math.floor(SETTINGS.COLS / 2);
export const START_ROW = SETTINGS.ROWS - SETTINGS.PIECE_SIZE;

let debugColorsIndex = 0;

export function getRandomJewelType(levelData: LevelData): EJewelType {
  if (DEBUG.COLORS) {
    const jewel = debugColorsIndex % (Object.values(EJewelType).length / 2);
    debugColorsIndex++;
    return jewel;
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

export function generateNewPiece(startId: React.RefObject<number>, level: LevelData): BoxData[] {
  const piece: BoxData[] = [];

  for (let i = 0; i < SETTINGS.PIECE_SIZE; i++) {  
    piece.push({
      id: startId.current++,
      row: START_ROW + i,
      col: START_COL,
      jewel: {
        type: getRandomJewelType(level),
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
    speed: DEBUG.SPEED ? 200 : Math.max(800 - (level * 50), 200),
    jewelFrequency: {
      [EJewelType.COMMON_1]: 400,
      [EJewelType.COMMON_2]: 400,
      [EJewelType.COMMON_3]: 400,
      [EJewelType.COMMON_4]: level > 5 ? 0 : 400,
      [EJewelType.COMMON_5]: level > 3 ? 400 : 0,
      [EJewelType.VALUE_1]: 300,
      [EJewelType.VALUE_2]: level > 1 ? 300 : 0,
      [EJewelType.VALUE_3]: level > 5 ? 300 : 0,
      [EJewelType.RARE_1]: 0,
      [EJewelType.RARE_2]: 0,
      [EJewelType.LUXE_1]: 0,
      [EJewelType.JEWELBOX]: 0,
    }
  };

  let freq = Object.values(levelData.jewelFrequency).reduce((total, freq) => total + freq);
  const jewelRareFrequency = 0.05 + level * 0.005;
  levelData.jewelFrequency[EJewelType.RARE_1] = Math.floor(freq * jewelRareFrequency);
  levelData.jewelFrequency[EJewelType.RARE_2] = level > 7
    ? Math.floor(freq * jewelRareFrequency)
    : 0;

  freq = Object.values(levelData.jewelFrequency).reduce((total, freq) => total + freq);
  const jewelLuxeFrequency = 0.05 + (level > 9 ? (level - 10) * 0.01 : 0);
  levelData.jewelFrequency[EJewelType.LUXE_1] = level > 9
    ? Math.floor(freq * jewelLuxeFrequency)
    : 0;

  freq = Object.values(levelData.jewelFrequency).reduce((total, freq) => total + freq);
  const jewelBoxFrequency = 0.01;
  levelData.jewelFrequency[EJewelType.JEWELBOX] = Math.floor(freq * jewelBoxFrequency);

  if (DEBUG.COLORS) {
    Object.values(EJewelType).forEach((type) => {
      levelData.jewelFrequency[type as EJewelType] = 1;
    });
  }

  return levelData;
}
