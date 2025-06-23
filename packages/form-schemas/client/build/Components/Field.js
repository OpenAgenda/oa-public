import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/Field.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import classNames from 'classnames';
import flattenFieldLabels from '../lib/flatten.js';
import isFieldEnabled from '../lib/isFieldEnabled.js';
import isFieldOptional from '../lib/isFieldOptional.js';
import hasHelp from '../lib/hasHelp.js';
import FieldCounter from './FieldCounter.js';
import Help from './Help.js';
import Info from './Info.js';
import Sub from './Sub.js';
import MultilingualField from './Multilingual.js';
import TextField from './TextField.js';
import HTMLField from './HTMLField.js';
import MarkdownField from './MarkdownField.js';
import SlateField from './SlateField.js';
import RadioField from './RadioField.js';
import SingleSelectField from './SingleSelectField.js';
import MultiSelectField from './MultiSelectField.js';
import CheckboxField from './CheckboxField.js';
import BooleanField from './BooleanField.js';
import DateField from './DateField.js';
import FileField from './FileField.js';
import ImageField from './ImageField.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const FieldComponents = {
  text: TextField,
  integer: TextField,
  number: TextField,
  textarea: TextField,
  link: TextField,
  email: TextField,
  phone: TextField,
  html: HTMLField,
  markdown: MarkdownField,
  slate: SlateField,
  radio: RadioField,
  select: SingleSelectField,
  multiselect: MultiSelectField,
  checkbox: CheckboxField,
  boolean: BooleanField,
  date: DateField,
  file: FileField,
  image: ImageField
};
const decoratedByFieldComponent = (field, key) => {
  var _context, _context2;
  if (_includesInstanceProperty(_context = ['boolean']).call(_context, field.fieldType)) return true;
  if (field.selfHandled.length === 0) return false;
  return _includesInstanceProperty(_context2 = field.selfHandled).call(_context2, key);
};
function getFieldComponent(props) {
  const {
    field: {
      fieldType,
      field
    },
    customComponents = {}
  } = props;
  const CustomComponent = customComponents[fieldType];
  if (CustomComponent) {
    return CustomComponent;
  }
  if (FieldComponents[fieldType]) {
    return FieldComponents[fieldType];
  }
  throw new Error("Field ".concat(field, " type has no associated component: ").concat(fieldType));
}
export default function Field(props) {
  var _context3;
  const {
    field: schemaField,
    disabled,
    value,
    onChange,
    error,
    labels,
    lang,
    className,
    relatedValues,
    role
  } = props;
  const field = flattenFieldLabels(schemaField, lang);
  const isMultilingual = Array.isArray(field.languages);
  const hasMaxCounter = field.max && !isMultilingual && !_includesInstanceProperty(_context3 = ['integer', 'number']).call(_context3, field.fieldType);

  // field is decorated with labels

  const FieldComponent = getFieldComponent(props);
  const isEnabled = isFieldEnabled(field, relatedValues, disabled);
  const isOptional = isFieldOptional(field, relatedValues);
  const enabledError = isEnabled && error;
  const fieldComponentsProps = {
    enabled: isEnabled,
    lang,
    field,
    value,
    error: enabledError,
    onChange,
    relatedValues,
    labels,
    userRole: role,
    isOptional
  };
  return /*#__PURE__*/_jsxDEV("div", {
    className: classNames({
      [className]: true,
      disabled: !isEnabled,
      'has-error': !!enabledError,
      'multilingual-input-field': isMultilingual
    }),
    children: [!decoratedByFieldComponent(field, 'label') && field.label ? /*#__PURE__*/_jsxDEV("label", {
      htmlFor: field.field,
      className: classNames({
        'control-label': true,
        'margin-right-xs': !isOptional || hasHelp(field)
      }),
      children: field.label
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 127,
      columnNumber: 9
    }, this) : null, !decoratedByFieldComponent(field, 'label') && !isOptional ? /*#__PURE__*/_jsxDEV("span", {
      className: classNames({
        'margin-right-xs': hasHelp(field),
        error: !!enabledError
      }),
      children: "(".concat(labels.required, ")")
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 138,
      columnNumber: 9
    }, this) : '', !decoratedByFieldComponent(field, 'help') && hasHelp(field) ? /*#__PURE__*/_jsxDEV(Help, {
      id: "help-".concat(field.field),
      label: field.help,
      lang: lang,
      link: field.helpLink,
      content: field.helpContent
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 9
    }, this) : null, !decoratedByFieldComponent(field, 'info') ? /*#__PURE__*/_jsxDEV(Info, {
      value: field.info
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 158,
      columnNumber: 9
    }, this) : null, isMultilingual ? /*#__PURE__*/_jsxDEV(MultilingualField, _objectSpread(_objectSpread({}, fieldComponentsProps), {}, {
      FieldComponent: FieldComponent
    }), void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 161,
      columnNumber: 9
    }, this) : /*#__PURE__*/_jsxDEV(FieldComponent, _objectSpread({}, fieldComponentsProps), void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 166,
      columnNumber: 9
    }, this), hasMaxCounter ? /*#__PURE__*/_jsxDEV(FieldCounter, {
      value: value,
      max: field.max
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 168,
      columnNumber: 24
    }, this) : null, !isMultilingual && !decoratedByFieldComponent(field, 'sub') ? /*#__PURE__*/_jsxDEV(Sub, {
      label: field.sub,
      error: enabledError,
      FieldCounter: true
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 170,
      columnNumber: 9
    }, this) : null]
  }, field.field, true, {
    fileName: _jsxFileName,
    lineNumber: 117,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=Field.js.map