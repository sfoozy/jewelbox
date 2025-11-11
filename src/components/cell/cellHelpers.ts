import { ECellState, ECellType } from "../../types/constants";

export function getCellColor(cellType: ECellType, cellState: ECellState) {
  switch(cellType) {
    case ECellType.ULTRA_COMMON_1:
      return cellState === ECellState.MATCHED ? "bg-red-400" : "bg-gradient-to-tr from-red-400 to-red-800";
    case ECellType.ULTRA_COMMON_2:
      return cellState === ECellState.MATCHED ? "bg-amber-400" : "bg-gradient-to-tr from-yellow-400 to-amber-600";
    case ECellType.ULTRA_COMMON_3:
      return cellState === ECellState.MATCHED ? "bg-lime-300" : "bg-gradient-to-tr from-lime-300 to-lime-600";
    case ECellType.ULTRA_COMMON_4:
      return cellState === ECellState.MATCHED ? "bg-slate-300" : "bg-gradient-to-tr from-slate-300 to-slate-500"
    case ECellType.ULTRA_COMMON_5:
      return cellState === ECellState.MATCHED ? "bg-green-500" : "bg-gradient-to-tr from-green-400 to-green-700";
    case ECellType.COMMON_1:
      return cellState === ECellState.MATCHED ? "bg-cyan-400" : "bg-gradient-to-tr from-teal-300 to-cyan-600";
    case ECellType.COMMON_2:
      return cellState === ECellState.MATCHED ? "bg-sky-400" : "bg-gradient-to-tr from-sky-500 to-blue-600";
    case ECellType.COMMON_3:
      return cellState === ECellState.MATCHED ? "bg-fuchsia-300" : "bg-gradient-to-tr from-pink-400 to-purple-600";
    case ECellType.RARE_1:
      return cellState === ECellState.MATCHED ? "bg-teal-100" : "bg-gradient-to-tr from-red-200 to-emerald-300"
    case ECellType.RARE_2:
      return cellState === ECellState.MATCHED ? "bg-purple-100" : "bg-gradient-to-tr from-lime-200 to-purple-400";
    case ECellType.ULTRA_RARE_1:
      return cellState === ECellState.MATCHED ? "bg-amber-200" : "bg-gradient-to-tr from-pink-200 to-orange-600";
    case ECellType.JEWELBOX:
      return cellState === ECellState.MATCHED ? "bg-gray-400" : "bg-gradient-to-br from-yellow-500 via-teal-500 to-pink-400";
  }
}
