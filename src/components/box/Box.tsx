import { UNIT } from "../../types/constants";
import type { BoxData } from "../../types/boxData";
import Jewel from "../jewel/Jewel";

function Box({
  box,
  rowCount
}: {
  box: BoxData
  rowCount: number
}) {

  return (
    <div
      className="absolute"
      style={{
        top: `${(rowCount - box.row - 1) * UNIT}px`, // row is based on bottom-left origin
        left: `${box.col * UNIT}px`
      }}
    >
      <Jewel jewel={box.jewel} />
    </div>
  )
};

export default Box;
