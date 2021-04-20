"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _react = require("react");

var _shallowequal = _interopRequireDefault(require("shallowequal"));

function useMemoOne(getResult, inputs) {
  var equalityFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _shallowequal.default;
  // using useState to generate initial value as it is lazy
  var initial = (0, _react.useState)(function () {
    return {
      inputs: inputs,
      result: getResult()
    };
  })[0];
  var committed = (0, _react.useRef)(initial); // persist any uncommitted changes after they have been committed

  var isInputMatch = Boolean(inputs && committed.current.inputs && equalityFn(inputs, committed.current.inputs));
  var cache = isInputMatch ? committed.current : {
    inputs: inputs,
    result: getResult()
  }; // commit the cache

  (0, _react.useEffect)(function () {
    committed.current = cache;
  }, [cache]);
  return cache.result;
}

var _default = useMemoOne;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=useMemoOne.js.map