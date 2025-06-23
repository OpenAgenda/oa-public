var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/BooleanField.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { useEffect } from 'react';
import classNames from 'classnames';
import hasHelp from '../lib/hasHelp.js';
import isFieldOptional from '../lib/isFieldOptional.js';
import Help from './Help.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
function defineChecked(field, value) {
  var _context;
  const {
    default: defaultValue
  } = field;
  const hasDefinedValue = !_includesInstanceProperty(_context = [null, undefined]).call(_context, value);
  const hasDefaultValue = defaultValue !== undefined;
  if (hasDefinedValue) {
    return value;
  }
  if (hasDefaultValue) {
    return defaultValue;
  }
  return false;
}
export default props => {
  const {
    lang,
    labels,
    relatedValues,
    field: {
      field: name,
      label,
      info
    },
    onChange,
    value,
    error,
    enabled
  } = props;
  const {
    field
  } = props;
  const isOptional = isFieldOptional(field, relatedValues);
  const checked = defineChecked(field, value);
  useEffect(function forceUncheckedBoxes() {
    if (!enabled) {
      return;
    }
    if (!checked && !value && value !== false) {
      onChange(false);
    }
  }, []);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "checkbox",
    children: /*#__PURE__*/_jsxDEV("label", {
      htmlFor: name,
      children: [/*#__PURE__*/_jsxDEV("input", {
        id: name,
        type: "checkbox",
        name: name,
        onChange: () => onChange(!checked),
        checked: checked,
        disabled: !enabled
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 53,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("span", {
        className: classNames({
          'margin-right-xs': hasHelp(field) || !isOptional
        }),
        children: label
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 61,
        columnNumber: 9
      }, this), isOptional ? null : /*#__PURE__*/_jsxDEV("span", {
        className: classNames({
          'margin-right-xs': hasHelp(field),
          error: !!error
        }),
        children: "(".concat(labels.required, ")")
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 69,
        columnNumber: 11
      }, this), hasHelp(field) ? /*#__PURE__*/_jsxDEV(Help, {
        id: "help-".concat(field.field),
        label: field.help,
        lang: lang,
        link: field.helpLink,
        content: field.helpContent
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 79,
        columnNumber: 11
      }, this) : null, info ? /*#__PURE__*/_jsxDEV("div", {
        className: "text-muted",
        children: info
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 87,
        columnNumber: 17
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 52,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 51,
    columnNumber: 5
  }, this);
};
//# sourceMappingURL=BooleanField.js.map