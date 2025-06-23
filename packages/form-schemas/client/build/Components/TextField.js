var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/TextField.js";
import { useEffect, useRef } from 'react';
import autosize from 'autosize';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const style = {
  resize: 'none'
};
export default function TextField(props) {
  var _ref;
  const {
    field,
    value,
    enabled,
    onChange
  } = props;
  const {
    field: name,
    placeholder,
    fieldType,
    default: defaultValue
  } = field;
  const ref = useRef();
  useEffect(() => {
    autosize(ref.current);
  }, [ref]);
  return /*#__PURE__*/_jsxDEV("textarea", {
    ref: ref,
    name: name,
    rows: fieldType === 'textarea' ? 3 : 1,
    value: (_ref = value !== null && value !== void 0 ? value : defaultValue) !== null && _ref !== void 0 ? _ref : '',
    placeholder: placeholder,
    className: "form-control",
    style: style,
    onKeyDown: e => {
      if (fieldType !== 'text' || e.key !== 'Enter') {
        return;
      }
      e.preventDefault();
    },
    onChange: e => {
      e.preventDefault();
      onChange(e.target.value);
    },
    disabled: !enabled
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 20,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=TextField.js.map