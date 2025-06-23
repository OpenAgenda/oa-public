var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldPreview/utils.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import { getLocaleValue } from '@openagenda/intl';
import labels from '../lib/labels.js';
import { Fragment as _Fragment, jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export const isFieldLinked = field => {
  if (field.enableWith || field.optionalWith) {
    return true;
  }
};
export const isFieldEditable = (field, _ref) => {
  let {
    isOwn,
    editableExtensions
  } = _ref;
  if (isOwn) {
    return true;
  }
  if (Array.isArray(editableExtensions)) {
    return _includesInstanceProperty(editableExtensions).call(editableExtensions, field.field);
  }
  return editableExtensions;
};
export const isFieldMultilingual = _ref2 => {
  let {
    languages
  } = _ref2;
  return !!Array.isArray(languages);
};
export const isFieldOptional = field => {
  var _field$optional;
  return (_field$optional = field === null || field === void 0 ? void 0 : field.optional) !== null && _field$optional !== void 0 ? _field$optional : true;
};
export const isFieldDisplayed = field => {
  var _field$display;
  return (_field$display = field === null || field === void 0 ? void 0 : field.display) !== null && _field$display !== void 0 ? _field$display : true;
};
export const getLabel = makeLabelGetter(labels);
export function getDefaultValueLabel(field, lang) {
  if (typeof field.default === 'string') {
    return getLocaleValue(field.default, lang);
  }
  if (typeof field.default === 'boolean') {
    if (field.default === true) {
      return getLabel('isSelected', lang);
    }
    return getLabel('notSelected', lang);
  }
  if (Array.isArray(field.default)) {
    if (field.fieldType === 'checkbox') {
      return field.default.map(value => {
        const option = field.options.find(obj => obj.id === value);
        return getLocaleValue(option.label, lang);
      }).join(', ');
    }
  }
  if (field.default !== null && typeof field.default === 'object') {
    return Object.values(field.default).join(', ');
  }
  const defaultValue = field.default;
  if (field.options) {
    const specificValuesFromOptions = field.options.find(obj => obj.id === defaultValue);
    return getLocaleValue(specificValuesFromOptions.label, lang);
  }
  return defaultValue;
}
export function getLinkedField() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const {
    field,
    schema
  } = options;
  const {
    linkType = field.enableWith ? 'enableWith' : 'optionalWith'
  } = options;
  if (!field[linkType]) {
    return null;
  }
  if (typeof field[linkType] === 'string') {
    return schema.fields.find(el => el.field === field[linkType]);
  }
  return schema.fields.find(el => el.field === field[linkType].field);
}
export function getFieldTypeIcon(field) {
  if (field.fieldType === 'languages') {
    return {
      has: false
    };
  }
  return {
    has: true,
    className: field.fieldType
  };
}
export function allowItemDisplayToggle(field) {
  var _context;
  if (!isFieldDisplayed(field)) {
    return true;
  }
  if (isFieldOptional(field)) {
    return true;
  }
  if (!_includesInstanceProperty(_context = [undefined, null]).call(_context, field.default)) {
    return true;
  }
  return false;
}
export const isAccessUndefined = field => !field.read && !field.write;
export function getFieldAccess(field, lang) {
  var _field$write, _field$read;
  const multilingual = {
    administrator: getLabel('adminAccess', lang),
    moderator: getLabel('moderatorAccess', lang),
    contributor: getLabel('contributorAccess', lang)
  };
  const writeFieldAccess = field === null || field === void 0 || (_field$write = field.write) === null || _field$write === void 0 ? void 0 : _field$write.map(access => multilingual[access]).join(', ');
  const readFieldAccess = field === null || field === void 0 || (_field$read = field.read) === null || _field$read === void 0 ? void 0 : _field$read.map(access => multilingual[access]).join(', ');
  if (field.write && !field.read) {
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [getLabel('writeAccess', lang), ": ", writeFieldAccess]
    }, void 0, true);
  }
  if (field.read && !field.write) {
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [getLabel('readAccess', lang), ": ", readFieldAccess]
    }, void 0, true);
  }
  if (field.write && field.read) {
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("span", {
        children: [getLabel('readAccess', lang), ": ", readFieldAccess]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 147,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("span", {
        children: " / "
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 150,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("span", {
        children: [getLabel('writeAccess', lang), ": ", writeFieldAccess]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 151,
        columnNumber: 9
      }, this)]
    }, void 0, true);
  }
}
//# sourceMappingURL=utils.js.map