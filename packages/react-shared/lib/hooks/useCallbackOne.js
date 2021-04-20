"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = useCallbackOne;

var _useMemoOne = _interopRequireDefault(require("./useMemoOne"));

function useCallbackOne(compute, deps, equalityFn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return (0, _useMemoOne.default)(function () {
    return compute;
  }, deps, equalityFn);
}

module.exports = exports.default;
//# sourceMappingURL=useCallbackOne.js.map