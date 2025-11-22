import { DEBUG, EJewelState, EJewelType } from "../../types/constants";

export function getJewelColor(jewelType: EJewelType, jewelState: EJewelState) {
  switch(jewelType) {
    case EJewelType.COMMON_1:
      return jewelState === EJewelState.MATCHED ? "bg-red-400" : "bg-gradient-to-tr from-red-400 to-red-700";
    case EJewelType.COMMON_2:
      return jewelState === EJewelState.MATCHED ? "bg-amber-300" : "bg-gradient-to-tr from-amber-300 to-amber-600";
    case EJewelType.COMMON_3:
      return jewelState === EJewelState.MATCHED ? "bg-lime-300" : "bg-gradient-to-tr from-lime-300 to-lime-600";
    case EJewelType.COMMON_4:
      return jewelState === EJewelState.MATCHED ? "bg-stone-300" : "bg-gradient-to-tr from-stone-300 to-stone-500"
    case EJewelType.COMMON_5:
      return jewelState === EJewelState.MATCHED ? "bg-cyan-300" : "bg-gradient-to-tr from-cyan-300 to-cyan-600";
    case EJewelType.VALUE_1:
      return jewelState === EJewelState.MATCHED ? "bg-green-500" : "bg-gradient-to-tr from-green-400 to-green-800";
    case EJewelType.VALUE_2:
      return jewelState === EJewelState.MATCHED ? "bg-blue-400" : "bg-gradient-to-tr from-sky-400 to-blue-700";
    case EJewelType.VALUE_3:
      return jewelState === EJewelState.MATCHED ? "bg-fuchsia-400" : "bg-gradient-to-tr from-fuchsia-400 to-fuchsia-800";
    case EJewelType.RARE_1:
      return jewelState === EJewelState.MATCHED ? "bg-indigo-300" : "bg-gradient-to-tr from-teal-200 to-violet-400";
    case EJewelType.RARE_2:
      return jewelState === EJewelState.MATCHED ? "bg-pink-300" : "bg-gradient-to-tr from-purple-100 to-orange-600";
    case EJewelType.LUXE_1:
      return jewelState === EJewelState.MATCHED ? "bg-lime-100" : "bg-gradient-to-tr from-red-200 to-emerald-300"
    case EJewelType.JEWELBOX:
      return jewelState === EJewelState.MATCHED ? "bg-gray-400" : "bg-gradient-to-br from-yellow-500 via-teal-500 to-pink-400";
  }
}

export function isJewelRare(type: EJewelType): boolean {
  return [EJewelType.RARE_1, EJewelType.RARE_2, EJewelType.LUXE_1].includes(type);
}

export function getJewelValue(type: EJewelType): number {
  switch (type) {
    case EJewelType.COMMON_1:
    case EJewelType.COMMON_2:
    case EJewelType.COMMON_3:
    case EJewelType.COMMON_4:
    case EJewelType.COMMON_5:
      return 75 * (DEBUG.LEVELS ? 10 : 1);
    case EJewelType.VALUE_1:
    case EJewelType.VALUE_2:
    case EJewelType.VALUE_3:
      return 150 * (DEBUG.LEVELS ? 10 : 1);
    case EJewelType.RARE_1:
    case EJewelType.RARE_2:
      return 300 * (DEBUG.LEVELS ? 10 : 1);
    case EJewelType.LUXE_1:
      return 600 * (DEBUG.LEVELS ? 10 : 1);
    case EJewelType.JEWELBOX:
      return 0;
  }
}

export function getJewelFrequency(level: number): Record<EJewelType, number> {
  const jewelFrequency: Record<EJewelType, number> = {
    [EJewelType.COMMON_1]: 400,
    [EJewelType.COMMON_2]: 400,
    [EJewelType.COMMON_3]: 400,
    [EJewelType.COMMON_4]: 0,
    [EJewelType.COMMON_5]: level > 3 ? 400 : 0,
    [EJewelType.VALUE_1]: 300,
    [EJewelType.VALUE_2]: level > 1 ? 300 : 0,
    [EJewelType.VALUE_3]: level > 5 ? 300 : 0,
    [EJewelType.RARE_1]: 0, // ~5% + 0.5% per level 
    [EJewelType.RARE_2]: 0, // ~5% + 0.5% per level
    [EJewelType.LUXE_1]: 0, // ~5% (starting at level 10) + 1% per level after
    [EJewelType.JEWELBOX]: 0, // 1%
  };

  let totalFrequency = Object.values(jewelFrequency).reduce((total, freq) => total + freq);
  const jewelRareFrequency = 0.05 + level * 0.005;
  jewelFrequency[EJewelType.RARE_1] = Math.floor(totalFrequency * jewelRareFrequency);
  jewelFrequency[EJewelType.RARE_2] = level > 7
    ? Math.floor(totalFrequency * jewelRareFrequency)
    : 0;

  totalFrequency = Object.values(jewelFrequency).reduce((total, freq) => total + freq);
  const jewelLuxeFrequency = 0.05 + (level > 9 ? (level - 10) * 0.01 : 0);
  jewelFrequency[EJewelType.LUXE_1] = level > 9
    ? Math.floor(totalFrequency * jewelLuxeFrequency)
    : 0;

  totalFrequency = Object.values(jewelFrequency).reduce((total, freq) => total + freq);
  const jewelBoxFrequency = 0.01;
  jewelFrequency[EJewelType.JEWELBOX] = Math.floor(totalFrequency * jewelBoxFrequency);

  if (DEBUG.COLORS) {
    Object.values(EJewelType).forEach((type) => {
      jewelFrequency[type as EJewelType] = 1;
    });
  }

  return jewelFrequency;
}

let debugColorsIndex = 0;

export function getRandomJewelType(jewelFrequency: Record<EJewelType, number>): EJewelType {
  if (DEBUG.COLORS) {
    const jewel = debugColorsIndex % (Object.values(EJewelType).length / 2);
    debugColorsIndex++;
    return jewel;
  }

  const choices: string[] = [];
  Object.entries(jewelFrequency).forEach(([type, freq]: [string, number]) => {
    for (let i = 0; i < freq; i++) {
      choices.push(type);
    }
  });

  const rand = Math.floor(Math.random() * choices.length);
  return Number(choices[rand]);
}