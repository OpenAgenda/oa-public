import "core-js/modules/es.function.name";
import _extends from "@babel/runtime-corejs3/helpers/extends";
import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _toConsumableArray from "@babel/runtime-corejs3/helpers/toConsumableArray";
import _someInstanceProperty from "@babel/runtime-corejs3/core-js/instance/some";
import _mapInstanceProperty from "@babel/runtime-corejs3/core-js/instance/map";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import _Array$isArray from "@babel/runtime-corejs3/core-js/array/is-array";
import _objectWithoutProperties from "@babel/runtime-corejs3/helpers/objectWithoutProperties";

var _this = this,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/ReactSelectField.js";

import React, { useCallback, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';
import ReactSelectInput from './ReactSelectInput';
import { jsx as ___EmotionJSX } from "@emotion/core";

var getValue = function getValue(arg) {
  var _arg$value;

  return (_arg$value = arg === null || arg === void 0 ? void 0 : arg.value) !== null && _arg$value !== void 0 ? _arg$value : arg;
};

export default (function (_ref) {
  var name = _ref.name,
      initialValue = _ref.initialValue,
      options = _ref.options,
      isCreatable = _ref.isCreatable,
      onBlur = _ref.onBlur,
      props = _objectWithoutProperties(_ref, ["name", "initialValue", "options", "isCreatable", "onBlur"]);

  var selectRef = useRef(null);
  var findOption = useCallback(function (opt) {
    var array = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options;
    var skipDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var result;

    if (_Array$isArray(array)) {
      for (var i = 0; i < array.length; i++) {
        var v = array[i];

        if (_Array$isArray(v.options)) {
          result = findOption(opt, v.options, true);
        } else if (v.value === opt) {
          result = v;
        }

        if (typeof result !== 'undefined') {
          return result;
        }
      }
    }

    if (result) {
      return result;
    }

    if (!skipDefault) {
      return {
        label: String(opt),
        value: opt
      };
    }
  }, [options]);
  var format = useCallback(function (selectedOption) {
    var _context;

    if (_includesInstanceProperty(_context = [undefined, null, '']).call(_context, selectedOption)) {
      return null;
    }

    return _Array$isArray(selectedOption) ? _mapInstanceProperty(selectedOption).call(selectedOption, function (v) {
      return findOption(v);
    }) : findOption(selectedOption);
  }, [findOption]);
  var parse = useCallback(function (value) {
    if (value === '') {
      return undefined;
    }

    return _Array$isArray(value) ? _mapInstanceProperty(value).call(value, getValue) : getValue(value);
  }, []);
  var handleBlur = useCallback(function (e) {
    if (isCreatable) {
      var _selectRef$current$st = selectRef.current.state,
          inputValue = _selectRef$current$st.inputValue,
          value = _selectRef$current$st.value;
      var alreadyInValue = inputValue.length && value ? value === null || value === void 0 ? void 0 : _someInstanceProperty(value).call(value, function (v) {
        return v.value === inputValue;
      }) : !inputValue.length;

      if (!alreadyInValue) {
        var _context2;

        selectRef.current.onChange(_concatInstanceProperty(_context2 = []).call(_context2, _toConsumableArray(value), [{
          label: inputValue,
          value: inputValue
        }]));
      }
    }

    if (typeof onBlur === 'function') {
      var _context3;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return onBlur.apply(void 0, _concatInstanceProperty(_context3 = [e]).call(_context3, args));
    }
  }, [onBlur, isCreatable]);
  var isValidNewOption = useCallback(function (value) {
    var _context4;

    return !_includesInstanceProperty(_context4 = [undefined, null, '']).call(_context4, value);
  }, []);
  var initialOption = useMemo(function () {
    return initialValue !== null && initialValue !== void 0 ? initialValue : format(initialValue);
  }, [format, initialValue]);
  return ___EmotionJSX(Field, _extends({
    name: name,
    innerRef: selectRef,
    component: ReactSelectInput,
    options: options,
    initialValue: initialOption,
    isCreatable: isCreatable,
    format: format,
    parse: parse,
    onBlur: handleBlur,
    isValidNewOption: isCreatable ? isValidNewOption : undefined,
    components: undefined
  }, props, {
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 103,
      columnNumber: 5
    }
  }));
});
//# sourceMappingURL=ReactSelectField.js.map