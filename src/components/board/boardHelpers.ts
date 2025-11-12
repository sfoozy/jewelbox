import type { CellData } from "../../types/cellData";
import { COLS, DEBUG_COLORS, DEBUG_LEVELS, ECellState, ECellType, PIECE_SIZE, ROWS } from "../../types/constants";
import type { LevelData } from "../../types/levelData";

export const START_COL = Math.floor(COLS / 2);
export const START_ROW = ROWS - PIECE_SIZE;
let cellCounter = 0;

export function getRandomCellType(levelData: LevelData): ECellType {
  if (DEBUG_COLORS) {
    return (cellCounter - 1) % (Object.keys(ECellType).length / 2)
  }
  
  const choices: string[] = [];
  Object.entries(levelData.cellFrequency).forEach(([type, freq]: [string, number]) => {
    for (let i = 0; i < freq; i++) {
      choices.push(type);
    }
  });

  const rand = Math.floor(Math.random() * choices.length);
  return Number(choices[rand]);
}

export function generateNewPiece(score: number, startCol: number): CellData[] {
  const piece = [];

  const levelData = getLevel(score);
  for (let i = 0; i < PIECE_SIZE; i++) {  
    piece.push({
      id: cellCounter++,
      type: getRandomCellType(levelData),
      state: ECellState.DIRTY,
      row: START_ROW + i,
      col: startCol
    });
  }

  // if any single cell is a JEWELBOX, make all cells in this piece a JEWELBOX
  if (piece.some(c => c.type === ECellType.JEWELBOX) && !DEBUG_COLORS) {
    piece.forEach(c => c.type = ECellType.JEWELBOX);
  }

  return piece;
}

export function generateEmptyBoard(): CellData[][] {
  return Array.from({ length: COLS }, () => []);
}

export function getCellScore(cellType: ECellType): number {
  switch (cellType) {
    case ECellType.ULTRA_COMMON_1:
    case ECellType.ULTRA_COMMON_2:
    case ECellType.ULTRA_COMMON_3:
    case ECellType.ULTRA_COMMON_4:
    case ECellType.ULTRA_COMMON_5:
      return 50 * (DEBUG_LEVELS ? 10 : 1);
    case ECellType.COMMON_1:
    case ECellType.COMMON_2:
    case ECellType.COMMON_3:
      return 75 * (DEBUG_LEVELS ? 10 : 1);
    case ECellType.RARE_1:
    case ECellType.RARE_2:
      return 300 * (DEBUG_LEVELS ? 10 : 1);
    case ECellType.ULTRA_RARE_1:
      return 600 * (DEBUG_LEVELS ? 10 : 1);
    case ECellType.JEWELBOX:
      return 0;
  }
}

export function getLevel(score: number): LevelData {
  const level = Math.floor(score / 10000);
  return {
    level: level,
    speed: Math.max(800 - (level * 50), 200),
    cellFrequency: {
      [ECellType.ULTRA_COMMON_1]: 20,
      [ECellType.ULTRA_COMMON_2]: 20,
      [ECellType.ULTRA_COMMON_3]: 20,
      [ECellType.ULTRA_COMMON_4]: 20,
      [ECellType.ULTRA_COMMON_5]: level > 3 ? 20 : 0,
      [ECellType.COMMON_1]: 16,
      [ECellType.COMMON_2]: level > 1 ? 16 : 0,
      [ECellType.COMMON_3]: level > 5 ? 16 : 0,
      [ECellType.RARE_1]: level > 5 ? 6 : 4,
      [ECellType.RARE_2]: level > 7 ? 6 : 0,
      [ECellType.ULTRA_RARE_1]: level > 9 ? 2 : 0,
      [ECellType.JEWELBOX]: 1,
    }
  };
}
