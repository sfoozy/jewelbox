import type { JewelData } from "../../types/jewelData";
import { EJewelType, SETTINGS } from "../../types/constants";
import { getJewelColor } from "./jewelHelpers";
import starImage from "../../resources/images/star_overlay.png";

function Jewel({
  jewel
}: {
  jewel: JewelData
}) {

  function getColorClassName() {
    return `${getJewelColor(jewel.type, jewel.state)}`
  }

  function renderImage(): React.ReactNode {
    let image;
    const size = SETTINGS.UNIT * 3 / 5;
    if (jewel.type === EJewelType.JEWELBOX) {
      image = starImage;
    }

    return image
      ? <img src={image} alt="icon" height={size} width={size} style={{ opacity: "10%" }} />
      : <></>
  }

  return (
    <div
      className={`
        border-2 border-gray-700 rounded-md box-border
        flex justify-center items-center
        ${getColorClassName()}`
      }
      style={{
        width: `${SETTINGS.UNIT}px`,
        height: `${SETTINGS.UNIT}px`,
      }}
    >
      { renderImage() }
    </div>
  )
};

export default Jewel;
