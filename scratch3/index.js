import SVG from "./draw.js"
import { LabelView } from "./blocks.js"
import style from "./style.js"

export function init(window) {
  SVG.init(window)

  LabelView.measuring = SVG.makeCanvas().getContext("2d")
}

export const makeStyle = style.makeStyle
export const makeStyleString = style.makeStyleString
export { newView, registerIconInfo } from "./blocks.js"
export {
  registerCommonIcon,
  registerHighContrastIcon,
  registerCategoryStyle,
} from "./style.js"
