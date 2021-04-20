"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _bind = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/bind"));

var _component = _interopRequireDefault(require("@loadable/component"));

// Wrapper with a working load method
var _default = function _default(fn, options) {
  var _context, _context2;

  var Component = (0, _component.default)(fn, options);
  Component.load = (0, _bind.default)(_context = fn.requireAsync || fn).call(_context, fn);
  Component.isReady = fn.isReady ? (0, _bind.default)(_context2 = fn.isReady).call(_context2, fn) : function () {
    return false;
  };
  return Component;
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=loadable.js.map