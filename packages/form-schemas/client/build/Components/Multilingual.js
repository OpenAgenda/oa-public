import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _isObject from "lodash/isObject.js";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/Multilingual.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import ih from 'immutability-helper';
import { useCallback } from 'react';
import FieldCounter from './FieldCounter.js';
import Sub from './Sub.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
function extractLanguageValue(value, l) {
  if (!value) return;
  if (typeof value === 'string') {
    return value;
  }
  return value === null || value === void 0 ? void 0 : value[l];
}
function multilingualizeValue(value, languages) {
  if (!value) return {};
  if (typeof value === 'string') {
    return _reduceInstanceProperty(languages).call(languages, (multilingualValue, language) => _objectSpread(_objectSpread({}, multilingualValue), {}, {
      [language]: value
    }), {});
  }
  return value;
}
const MultilingualField = _ref => {
  let {
    onChange,
    value,
    field,
    error,
    enabled,
    lang,
    FieldComponent
  } = _ref;
  const myOnChange = useCallback((language, singleLanguageValue) => {
    const multilingualizedValue = multilingualizeValue(value, field.languages);
    onChange(_objectSpread(_objectSpread({}, multilingualizedValue), {}, {
      [language]: singleLanguageValue
    }));
  }, [onChange, field.languages, value]);
  const renderField = useCallback(l => {
    const languageField = ih(field, {
      default: {
        $set: _get(field, ['default', l], _isObject(field.default) ? null : field.default)
      }
    });
    return /*#__PURE__*/_jsxDEV("div", {
      children: [/*#__PURE__*/_jsxDEV(FieldComponent, {
        lang: lang,
        field: languageField,
        enabled: enabled,
        value: extractLanguageValue(value, l),
        onChange: v => myOnChange(l, v)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 71,
        columnNumber: 11
      }, this), field.max ? /*#__PURE__*/_jsxDEV(FieldCounter, {
        value: _get(value, l),
        max: field.max
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 79,
        columnNumber: 13
      }, this) : null, /*#__PURE__*/_jsxDEV(Sub, {
        label: field.sub,
        error: _get(error, l)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 81,
        columnNumber: 11
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 9
    }, this);
  }, [enabled, error, field, value, myOnChange, lang]);
  if (field.languages.length === 1) {
    return renderField(field.languages[0]);
  }
  return /*#__PURE__*/_jsxDEV("ul", {
    className: "list-unstyled",
    children: field.languages.map(l => /*#__PURE__*/_jsxDEV("li", {
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "lang-input",
        children: [/*#__PURE__*/_jsxDEV("label", {
          htmlFor: "".concat(field.field, ".").concat(l),
          children: l
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 97,
          columnNumber: 13
        }, this), renderField(l)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 11
      }, this)
    }, "".concat(field.field, "_").concat(l), false, {
      fileName: _jsxFileName,
      lineNumber: 95,
      columnNumber: 9
    }, this))
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 93,
    columnNumber: 5
  }, this);
};
export default MultilingualField;
//# sourceMappingURL=Multilingual.js.map