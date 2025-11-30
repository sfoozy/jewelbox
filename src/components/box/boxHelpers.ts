import type { BoxData } from "../../types/boxData";

export function deepCopyBox(box: BoxData): BoxData {
  return {
    id: box.id,
    row: box.row,
    col: box.col,
    jewel: {
      type: box.jewel.type,
      state: box.jewel.state
    }
  };
}