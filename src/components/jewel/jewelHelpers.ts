import { DEBUG_LEVELS as DEBUG_SCORE, EJewelState, EJewelType } from "../../types/constants";

export function getJewelColor(jewelType: EJewelType, jewelState: EJewelState) {
  switch(jewelType) {
    case EJewelType.COMMON_1:
      return jewelState === EJewelState.MATCHED ? "bg-red-400" : "bg-gradient-to-tr from-red-400 to-red-700";
    case EJewelType.COMMON_2:
      return jewelState === EJewelState.MATCHED ? "bg-amber-400" : "bg-gradient-to-tr from-amber-400 to-amber-600";
    case EJewelType.COMMON_3:
      return jewelState === EJewelState.MATCHED ? "bg-lime-300" : "bg-gradient-to-tr from-lime-300 to-lime-600";
    case EJewelType.COMMON_4:
      return jewelState === EJewelState.MATCHED ? "bg-slate-300" : "bg-gradient-to-tr from-stone-300 to-stone-500"
    case EJewelType.COMMON_5:
      return jewelState === EJewelState.MATCHED ? "bg-cyan-400" : "bg-gradient-to-tr from-teal-300 to-cyan-600";
    case EJewelType.VALUE_1:
      return jewelState === EJewelState.MATCHED ? "bg-green-500" : "bg-gradient-to-tr from-green-400 to-green-700";
    case EJewelType.VALUE_2:
      return jewelState === EJewelState.MATCHED ? "bg-blue-400" : "bg-gradient-to-tr from-sky-500 to-blue-700";
    case EJewelType.VALUE_3:
      return jewelState === EJewelState.MATCHED ? "bg-fuchsia-400" : "bg-gradient-to-tr from-pink-400 to-fuchsia-700";
    case EJewelType.RARE_1:
      return jewelState === EJewelState.MATCHED ? "bg-indigo-300" : "bg-gradient-to-tr from-teal-200 to-violet-400";
    case EJewelType.RARE_2:
      return jewelState === EJewelState.MATCHED ? "bg-red-300" : "bg-gradient-to-tr from-pink-100 to-orange-500";
    case EJewelType.LUX_1:
      return jewelState === EJewelState.MATCHED ? "bg-lime-100" : "bg-gradient-to-tr from-red-200 to-emerald-300"
    case EJewelType.JEWELBOX:
      return jewelState === EJewelState.MATCHED ? "bg-gray-400" : "bg-gradient-to-br from-yellow-500 via-teal-500 to-pink-400";
  }
}

export function isRareJewel(type: EJewelType): boolean {
  return [EJewelType.RARE_1, EJewelType.RARE_2, EJewelType.LUX_1].includes(type);
}

export function getJewelValue(type: EJewelType): number {
  switch (type) {
    case EJewelType.COMMON_1:
    case EJewelType.COMMON_2:
    case EJewelType.COMMON_3:
    case EJewelType.COMMON_4:
    case EJewelType.COMMON_5:
      return 50 * (DEBUG_SCORE ? 10 : 1);
    case EJewelType.VALUE_1:
    case EJewelType.VALUE_2:
    case EJewelType.VALUE_3:
      return 100 * (DEBUG_SCORE ? 10 : 1);
    case EJewelType.RARE_1:
    case EJewelType.RARE_2:
      return 300 * (DEBUG_SCORE ? 10 : 1);
    case EJewelType.LUX_1:
      return 600 * (DEBUG_SCORE ? 10 : 1);
    case EJewelType.JEWELBOX:
      return 0;
  }
}
