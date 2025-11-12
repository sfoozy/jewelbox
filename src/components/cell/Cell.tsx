import type { CellData } from "../../types/cellData";
import { ECellType, UNIT } from "../../types/constants";
import { getCellColor, isRare } from "./cellHelpers";
import starImage from "../../resources/images/star_overlay.png";
import jewelImage from "../../resources/images/jewel_overlay.png";

function Cell({
  cell,
  rowCount
}: {
  cell: CellData
  rowCount: number
}) {

  function getColorClassName() {
    return `${getCellColor(cell.type, cell.state)}`
  }

  function renderImage(): React.ReactNode {
    let image;
    const size = UNIT * 3 / 5;
    if (cell.type === ECellType.JEWELBOX) {
      image = starImage;
    }
    // else if (isRare(cell.type)) {
    //   image = jewelImage;
    // }

    return image
      ? <img src={image} alt="icon" height={size} width={size} style={{ opacity: "10%" }} />
      : <></>
  }

  return (
    <div
      className={`
        absolute border border-gray-700 rounded-md box-border
        flex justify-center items-center
        ${getColorClassName()}`
      }
      style={{
        width: `${UNIT}px`,
        height: `${UNIT}px`,
        top: `${(rowCount - cell.row - 1) * UNIT}px`, // row is based on bottom-left origin
        left: `${cell.col * UNIT}px`
      }}
    >
      { renderImage() }
    </div>
  )
};

export default Cell;
