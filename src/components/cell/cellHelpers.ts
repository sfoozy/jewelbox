import { ECellState, ECellType } from "../../types/constants";

export function getCellColor(cellType: ECellType, cellState: ECellState) {
  switch(cellType) {
    case ECellType.ULTRA_COMMON_1:
      return cellState === ECellState.MATCHED ? "bg-red-400" : "bg-gradient-to-tr from-red-400 to-red-800";
    case ECellType.ULTRA_COMMON_2:
      return cellState === ECellState.MATCHED ? "bg-amber-400" : "bg-gradient-to-tr from-amber-400 to-amber-600";
    case ECellType.ULTRA_COMMON_3:
      return cellState === ECellState.MATCHED ? "bg-lime-300" : "bg-gradient-to-tr from-lime-300 to-lime-600";
    case ECellType.ULTRA_COMMON_4:
      return cellState === ECellState.MATCHED ? "bg-slate-300" : "bg-gradient-to-tr from-stone-300 to-stone-500"
    case ECellType.ULTRA_COMMON_5:
      return cellState === ECellState.MATCHED ? "bg-cyan-400" : "bg-gradient-to-tr from-teal-300 to-cyan-600";
    case ECellType.COMMON_1:
      return cellState === ECellState.MATCHED ? "bg-green-500" : "bg-gradient-to-tr from-green-400 to-green-700";
    case ECellType.COMMON_2:
      return cellState === ECellState.MATCHED ? "bg-blue-400" : "bg-gradient-to-tr from-sky-500 to-blue-700";
    case ECellType.COMMON_3:
      return cellState === ECellState.MATCHED ? "bg-fuchsia-400" : "bg-gradient-to-tr from-rose-400 to-fuchsia-700";
    case ECellType.RARE_1:
      return cellState === ECellState.MATCHED ? "bg-indigo-300" : "bg-gradient-to-tr from-teal-200 to-violet-400";
    case ECellType.RARE_2:
      return cellState === ECellState.MATCHED ? "bg-red-300" : "bg-gradient-to-tr from-pink-100 to-orange-500";
    case ECellType.ULTRA_RARE_1:
      return cellState === ECellState.MATCHED ? "bg-lime-100" : "bg-gradient-to-tr from-red-200 to-emerald-300"
    case ECellType.JEWELBOX:
      return cellState === ECellState.MATCHED ? "bg-gray-400" : "bg-gradient-to-br from-yellow-500 via-teal-500 to-pink-400";
  }
}

export function isRare(type: ECellType): boolean {
  return [ECellType.RARE_1, ECellType.RARE_2, ECellType.ULTRA_RARE_1].includes(type);
}
