import type { LevelData } from "../../types/levelData";
import Jewel from "../Jewel/Jewel";
import { EJewelState, EJewelType } from "../../types/constants";
import { getJewelValue } from "../Jewel/jewelHelpers";

function JewelDisplay({
  levelData
} : {
  levelData: LevelData
}) {
  return (
    <div className="flex flex-col items-start justify-end gap-4 h-full mb-8">
      {
        levelData.jewelFrequency[EJewelType.LUXE_1] > 0
        &&
        <div>
          <div className="text-lg font-semibold text-amber-400">LUXE</div>
          <div className="relative flex gap-2 items-center">
            <Jewel jewel={{ type: EJewelType.LUXE_1, state: EJewelState.CLEAN }} />
            <div className="text-sm font-semibold text-white"> = {getJewelValue(EJewelType.LUXE_1)}</div>
          </div>
        </div>
      }

      <div>
        <div className="text-lg font-semibold text-amber-400">RARE</div>
        <div className="relative flex gap-2 items-center">
          <Jewel jewel={{ type: EJewelType.RARE_1, state: EJewelState.CLEAN }} />
          {
            levelData.jewelFrequency[EJewelType.RARE_2] > 0
            &&
            <Jewel jewel={{ type: EJewelType.RARE_2, state: EJewelState.CLEAN }} />
          }
          <div className="text-sm font-semibold text-white"> = {getJewelValue(EJewelType.RARE_1)}</div>
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold text-amber-400">VALUE</div>
        <div className="relative flex gap-2 items-center">
          <Jewel jewel={{ type: EJewelType.VALUE_1, state: EJewelState.CLEAN }} />
          {
            levelData.jewelFrequency[EJewelType.VALUE_2] > 0
            &&
            <Jewel jewel={{ type: EJewelType.VALUE_2, state: EJewelState.CLEAN }} />
          }
          {
            levelData.jewelFrequency[EJewelType.VALUE_3] > 0
            &&
            <Jewel jewel={{ type: EJewelType.VALUE_3, state: EJewelState.CLEAN }} />
          }
          <div className="text-sm font-semibold text-white"> = {getJewelValue(EJewelType.VALUE_1)}</div>
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold text-amber-400">COMMON</div>
        <div className="relative flex gap-2 items-center">
          <Jewel jewel={{ type: EJewelType.COMMON_1, state: EJewelState.CLEAN }} />
          <Jewel jewel={{ type: EJewelType.COMMON_2, state: EJewelState.CLEAN }} />
          <Jewel jewel={{ type: EJewelType.COMMON_3, state: EJewelState.CLEAN }} />
          {
            levelData.jewelFrequency[EJewelType.COMMON_4] > 0
            &&
            <Jewel jewel={{ type: EJewelType.COMMON_4, state: EJewelState.CLEAN }} />
          }
          {
            levelData.jewelFrequency[EJewelType.COMMON_5] > 0
            &&
            <Jewel jewel={{ type: EJewelType.COMMON_5, state: EJewelState.CLEAN }} />
          }
          <div className="text-sm font-semibold text-white"> = {getJewelValue(EJewelType.COMMON_1)}</div>
        </div>
      </div>
    </div>
  );
};

export default JewelDisplay;