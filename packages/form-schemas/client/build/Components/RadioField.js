var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/RadioField.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import { useState } from 'react';
import formSchemaLabels from '@openagenda/labels/form-schemas/index.js';
import makeLabelGetter from '@openagenda/labels';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(formSchemaLabels);
export default function RadioField(props) {
  const {
    onChange,
    field,
    value,
    lang,
    enabled,
    isOptional
  } = props;
  const [hasClicked, setHasClicked] = useState(false);
  const onSelect = option => {
    setHasClicked(true);
    onChange(option.id);
  };
  const isChecked = option => {
    if (!hasClicked && !value && field.default) {
      return option.id === field.default;
    }
    return option.id === value;
  };
  return /*#__PURE__*/_jsxDEV(_Fragment, {
    children: field.options.filter(o => o.display).concat(isOptional ? [{
      label: getLabel('noChoice', lang),
      id: null
    }] : []).map(o => /*#__PURE__*/_jsxDEV("div", {
      className: "radio",
      children: /*#__PURE__*/_jsxDEV("label", {
        htmlFor: "".concat(field.field, ".").concat(o.value),
        children: [/*#__PURE__*/_jsxDEV("input", {
          id: "".concat(field.field, ".").concat(o.value),
          type: "radio",
          name: field.field,
          onChange: onSelect.bind(null, o),
          checked: isChecked(o),
          disabled: !enabled
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 44,
          columnNumber: 15
        }, this), o.label, o.info && /*#__PURE__*/_jsxDEV("div", {
          className: "text-muted",
          children: o.info
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 53,
          columnNumber: 26
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 13
      }, this)
    }, [field.field, o.value].join('.'), false, {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 11
    }, this))
  }, void 0, false);
}
//# sourceMappingURL=RadioField.js.map