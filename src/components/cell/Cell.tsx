import type { CellData } from "../../types/cellData";
import { ECellState, ECellType, UNIT } from "../../types/constants";
import { getCellColor } from "./cellHelpers";

function Cell({
  cell,
  rowCount
}: {
  cell: CellData
  rowCount: number
}) {

  function getClassName(cellType: ECellType, cellState: ECellState) {
    return `${getCellColor(cellType, cellState)}`
  }

  return (
    <div
      className={`absolute border border-gray-700 rounded-md box-border ${getClassName(cell.type, cell.state)}`}
      style={{
        width: `${UNIT}px`,
        height: `${UNIT}px`,
        top: `${(rowCount - cell.row - 1) * UNIT}px`, // row is based on bottom-left origin
        left: `${cell.col * UNIT}px`
      }}
    >
    </div>
  )
};

export default Cell;
