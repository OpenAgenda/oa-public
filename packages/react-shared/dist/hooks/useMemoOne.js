"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.useMemoOne = useMemoOne;
exports.useCallbackOne = exports.default = void 0;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/array/is-array"));

var _react = require("react");

var _shallowequal = _interopRequireDefault(require("shallowequal"));

function useMemoOne(compute, deps) {
  var equalityFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _shallowequal.default;
  var value = (0, _react.useRef)(null);
  var previousDeps = (0, _react.useRef)(null);

  if (!(0, _isArray.default)(previousDeps.current) || !equalityFn(previousDeps.current, deps)) {
    previousDeps.current = deps;
    value.current = compute();
  }

  return value.current;
}

var useCallbackOne = function useCallbackOne(compute, deps, equalityFn) {
  return useMemoOne(function () {
    return compute;
  }, deps, equalityFn);
};

exports.useCallbackOne = useCallbackOne;
var _default = useMemoOne;
exports.default = _default;
//# sourceMappingURL=useMemoOne.js.map