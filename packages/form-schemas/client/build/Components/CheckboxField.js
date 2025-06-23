var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/CheckboxField.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
export default function CheckboxField(props) {
  const {
    field: {
      options,
      field: name,
      default: defaultValue
    },
    value,
    onChange,
    enabled
  } = props;
  const defaultChecked = [].concat(defaultValue || []);
  const checked = [].concat(value || defaultChecked);
  return /*#__PURE__*/_jsxDEV(_Fragment, {
    children: options.filter(o => o.display).map(o => /*#__PURE__*/_jsxDEV("div", {
      className: "checkbox",
      children: /*#__PURE__*/_jsxDEV("label", {
        htmlFor: "".concat(name, ".").concat(o.value),
        children: [/*#__PURE__*/_jsxDEV("input", {
          id: "".concat(name, ".").concat(o.value),
          type: "checkbox",
          onChange: onChange.bind(null, _includesInstanceProperty(checked).call(checked, o.id) ? checked.filter(cId => cId !== o.id) : checked.concat(o.id)),
          checked: _includesInstanceProperty(checked).call(checked, o.id),
          disabled: !enabled
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 20,
          columnNumber: 15
        }, this), o.label, o.info && /*#__PURE__*/_jsxDEV("div", {
          className: "text-muted",
          children: o.info
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 33,
          columnNumber: 26
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 19,
        columnNumber: 13
      }, this)
    }, [name, o.value].join('.'), false, {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 11
    }, this))
  }, void 0, false);
}
//# sourceMappingURL=CheckboxField.js.map