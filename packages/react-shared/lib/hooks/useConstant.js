"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = useConstant;

var _react = require("react");

function useConstant(init) {
  var initiated = (0, _react.useRef)(false);
  var ref = (0, _react.useRef)(undefined);

  if (!initiated.current) {
    initiated.current = true;
    ref.current = init();
  }

  return ref.current;
}

module.exports = exports.default;
//# sourceMappingURL=useConstant.js.map