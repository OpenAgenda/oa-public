var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/Section.js";
import flattenSectionLabels from '../lib/flatten.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default function Section(props) {
  const {
    lang,
    section
  } = props;
  const {
    label
  } = flattenSectionLabels(section, lang);
  if (!section.display) return;
  if (!label) {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "divider margin-bottom-lg margin-top-sm"
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 11,
      columnNumber: 12
    }, this);
  }
  return /*#__PURE__*/_jsxDEV("h3", {
    className: "margin-v-md",
    children: label
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 14,
    columnNumber: 10
  }, this);
}
//# sourceMappingURL=Section.js.map