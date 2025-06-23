var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/Help.js";
import ReactMarkdown from 'react-markdown';
import labels from '@openagenda/labels/form-schemas/index.js';
import { MoreInfo } from '@openagenda/react-shared';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
function _target(link) {
  if (!link || link.indexOf('mailto:') !== -1) return '_self';
  return '_blank';
}
export default function Help(_ref) {
  let {
    lang,
    label,
    content,
    link
  } = _ref;
  if (content) {
    return /*#__PURE__*/_jsxDEV(MoreInfo, {
      content: /*#__PURE__*/_jsxDEV(ReactMarkdown, {
        disallowedElements: ['p'],
        unwrapDisallowed: true,
        children: content
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 16,
        columnNumber: 11
      }, this),
      children: /*#__PURE__*/_jsxDEV("a", {
        target: _target(link),
        href: link,
        children: label || labels.help[lang]
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 21,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 7
    }, this);
  }
  return /*#__PURE__*/_jsxDEV("a", {
    className: "margin-right-xs",
    target: _target(link),
    href: link,
    children: label || labels.help[lang]
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 29,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=Help.js.map