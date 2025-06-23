var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/admin-agendas/components/src/AgendaItem.js";
import React from 'react';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const AgendaItem = _ref => {
  let {
    agenda,
    onSelect
  } = _ref;
  const handleClick = () => {
    onSelect(agenda.uid, 1);
  };
  return /*#__PURE__*/_jsxDEV("div", {
    className: "agenda-item media cursor-pointer",
    onClick: handleClick,
    role: "button",
    tabIndex: 0,
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "media-body",
      children: /*#__PURE__*/_jsxDEV("h4", {
        className: "title media-heading",
        children: agenda.title
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 16,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 9,
    columnNumber: 5
  }, this);
};
export default AgendaItem;
//# sourceMappingURL=AgendaItem.js.map