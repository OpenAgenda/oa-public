"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/extends"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/toConsumableArray"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _reactFinalForm = require("react-final-form");

var _ReactSelectInput = _interopRequireDefault(require("./ReactSelectInput"));

var _core = require("@emotion/core");

var _this = void 0,
    _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/ReactSelectField.js";

var getValue = function getValue(arg) {
  var _arg$value;

  return (_arg$value = arg === null || arg === void 0 ? void 0 : arg.value) !== null && _arg$value !== void 0 ? _arg$value : arg;
};

var _default = function _default(_ref) {
  var name = _ref.name,
      initialValue = _ref.initialValue,
      options = _ref.options,
      isCreatable = _ref.isCreatable,
      onBlur = _ref.onBlur,
      props = (0, _objectWithoutProperties2.default)(_ref, ["name", "initialValue", "options", "isCreatable", "onBlur"]);
  var selectRef = (0, _react.useRef)(null);
  var findOption = (0, _react.useCallback)(function (opt) {
    var array = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options;
    var skipDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var result;

    if ((0, _isArray.default)(array)) {
      for (var i = 0; i < array.length; i++) {
        var v = array[i];

        if ((0, _isArray.default)(v.options)) {
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
  var format = (0, _react.useCallback)(function (selectedOption) {
    var _context;

    if ((0, _includes.default)(_context = [undefined, null, '']).call(_context, selectedOption)) {
      return null;
    }

    return (0, _isArray.default)(selectedOption) ? (0, _map.default)(selectedOption).call(selectedOption, function (v) {
      return findOption(v);
    }) : findOption(selectedOption);
  }, [findOption]);
  var parse = (0, _react.useCallback)(function (value) {
    if (value === '') {
      return undefined;
    }

    return (0, _isArray.default)(value) ? (0, _map.default)(value).call(value, getValue) : getValue(value);
  }, []);
  var handleBlur = (0, _react.useCallback)(function (e) {
    if (isCreatable) {
      var _selectRef$current$st = selectRef.current.state,
          inputValue = _selectRef$current$st.inputValue,
          value = _selectRef$current$st.value;
      var alreadyInValue = inputValue.length && value ? value === null || value === void 0 ? void 0 : (0, _some.default)(value).call(value, function (v) {
        return v.value === inputValue;
      }) : !inputValue.length;

      if (!alreadyInValue) {
        var _context2;

        selectRef.current.onChange((0, _concat.default)(_context2 = []).call(_context2, (0, _toConsumableArray2.default)(value), [{
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

      return onBlur.apply(void 0, (0, _concat.default)(_context3 = [e]).call(_context3, args));
    }
  }, [onBlur, isCreatable]);
  var isValidNewOption = (0, _react.useCallback)(function (value) {
    var _context4;

    return !(0, _includes.default)(_context4 = [undefined, null, '']).call(_context4, value);
  }, []);
  var initialOption = (0, _react.useMemo)(function () {
    return initialValue !== null && initialValue !== void 0 ? initialValue : format(initialValue);
  }, [format, initialValue]);
  return (0, _core.jsx)(_reactFinalForm.Field, (0, _extends2.default)({
    name: name,
    innerRef: selectRef,
    component: _ReactSelectInput.default,
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
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=ReactSelectField.js.map