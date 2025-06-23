import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/ChooseFieldType.js";
import _valuesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/values";
import { useCallback } from 'react';
import isInteger from '@openagenda/utils/isInteger.js';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import FormSchemaComponent from '../index.js';
import labels from './lib/labels.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(labels);
const fieldTypeChoices = [{
  id: 1,
  value: 'text',
  label: labels.textFieldType
}, {
  id: 4,
  value: 'textarea',
  label: labels.textareaFieldType
}, {
  id: 5,
  value: 'markdown',
  label: labels.markdownFieldType,
  info: labels.markdownFieldTypeInfo
}, {
  id: 6,
  value: 'integer',
  label: labels.integerFieldType
}, {
  id: 10,
  value: 'link',
  label: labels.linkFieldType
}, {
  id: 9,
  value: 'email',
  label: labels.emailFieldType
}, {
  id: 15,
  value: 'phone',
  label: labels.phoneFieldType
}, {
  id: 7,
  value: 'boolean',
  label: labels.booleanFieldType,
  info: labels.booleanFieldTypeInfo
}, {
  id: 3,
  value: 'checkbox',
  label: labels.checkboxFieldType,
  info: labels.checkboxFieldTypeInfo
}, {
  id: 12,
  value: 'multiselect',
  label: labels.multiselectFieldType,
  info: labels.multiselectFieldTypeInfo
}, {
  id: 2,
  value: 'radio',
  label: labels.radioFieldType,
  info: labels.radioFieldTypeInfo
}, {
  id: 11,
  value: 'select',
  label: labels.selectFieldType,
  info: labels.selectFieldTypeInfo
}, {
  id: 13,
  value: 'date',
  label: labels.dateFieldType,
  info: labels.dateFieldTypeInfo
}, {
  id: 14,
  value: 'section',
  label: labels.sectionType,
  info: labels.sectionTypeInfo
}];
const flatChoices = lang => fieldTypeChoices.map(c => {
  var _c$info, _c$info2;
  return _objectSpread(_objectSpread({}, c), {}, {
    label: c.label[lang] || c.label.en,
    info: ((_c$info = c.info) === null || _c$info === void 0 ? void 0 : _c$info[lang]) || ((_c$info2 = c.info) === null || _c$info2 === void 0 ? void 0 : _c$info2.en)
  });
});
const getFieldType = valueOrId => fieldTypeChoices.find(choice => choice[isInteger(valueOrId) ? 'id' : 'value'] === valueOrId);
const ChosenType = _ref => {
  let {
    lang,
    value,
    onReset
  } = _ref;
  const {
    label,
    info
  } = getFieldType(value);
  return /*#__PURE__*/_jsxDEV("div", {
    children: [/*#__PURE__*/_jsxDEV("div", {
      children: label[lang]
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 109,
      columnNumber: 7
    }, this), info ? /*#__PURE__*/_jsxDEV("div", {
      className: "text-muted",
      children: info[lang]
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 15
    }, this) : null, /*#__PURE__*/_jsxDEV("button", {
      type: "button",
      className: "btn btn-link padding-all-z",
      onClick: onReset,
      children: getLabel('chooseOtherType', lang)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 111,
      columnNumber: 7
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 108,
    columnNumber: 5
  }, this);
};
export default function ChooseFieldType(_ref2) {
  let {
    value,
    onChange: propsOnChange,
    lang
  } = _ref2;
  const onChange = useCallback(choice => {
    if (!choice) {
      propsOnChange(null);
      return;
    }
    const fieldTypeChoice = getFieldType(_valuesInstanceProperty(choice).fieldType);
    propsOnChange(fieldTypeChoice.value);
  }, [propsOnChange]);
  if (value) {
    return /*#__PURE__*/_jsxDEV(ChosenType, {
      onReset: () => onChange(null),
      value: value,
      lang: lang,
      onChange: onChange
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 7
    }, this);
  }
  return /*#__PURE__*/_jsxDEV(FormSchemaComponent, {
    stateless: true,
    values: value ? {
      fieldType: getFieldType(value).id
    } : {},
    onChange: onChange,
    schema: {
      fields: [{
        field: 'fieldType',
        placeholder: getLabel('chooseFieldTypePlaceholder', lang),
        fieldType: 'select',
        label: getLabel('chooseFieldType', lang),
        optional: false,
        options: flatChoices(lang)
      }]
    },
    actionComponents: [{
      position: 'bottom',
      Component: () => null
    }]
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 151,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=ChooseFieldType.js.map