import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/DateField.js";
import { Calendar } from 'react-date-range';
import { Dropdown } from '@openagenda/react-shared';
import { format } from 'date-fns';
import * as rdrLocales from 'react-date-range/dist/locale/index.js';
import dateLabels from '@openagenda/labels/form-schemas/date.js';
import makeLabelGetter from '@openagenda/labels';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(dateLabels);

// if (import.meta.webpackHot) import.meta.webpackHot.accept();

const getContent = (value, placeholder, lang) => {
  if (!value) return placeholder || getLabel('pickADate', lang);
  return format(value, 'yyyy-MM-dd');
};
const getValueAsDate = v => {
  if (!v) return v;
  return typeof v === 'string' ? new Date(v) : v;
};
function DateField(_ref) {
  let {
    field,
    value,
    enabled,
    onChange,
    lang,
    className
  } = _ref;
  const {
    placeholder
  } = field;
  const cleanValue = getValueAsDate(value);
  return /*#__PURE__*/_jsxDEV("div", {
    className: className || '',
    children: enabled ? /*#__PURE__*/_jsxDEV(Dropdown, {
      className: "dropdown btn-group open",
      Trigger: props => /*#__PURE__*/_jsxDEV("button", _objectSpread(_objectSpread({
        type: "button"
      }, props), {}, {
        className: "form-control btn btn-default",
        children: [getContent(cleanValue, placeholder, lang), "\xA0", /*#__PURE__*/_jsxDEV("span", {
          className: "caret"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 42,
          columnNumber: 15
        }, this)]
      }), void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 36,
        columnNumber: 13
      }, this),
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "dropdown-calendar",
        style: {
          minWidth: '300px'
        },
        children: /*#__PURE__*/_jsxDEV(Calendar, {
          date: cleanValue || null,
          onChange: onChange,
          locale: rdrLocales[lang]
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 47,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 46,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 9
    }, this) : /*#__PURE__*/_jsxDEV("input", {
      disabled: true,
      className: "form-control inline",
      value: getContent(cleanValue, placeholder, lang),
      style: {
        width: 'auto'
      }
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 55,
      columnNumber: 9
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 31,
    columnNumber: 5
  }, this);
}
export default DateField;
//# sourceMappingURL=DateField.js.map