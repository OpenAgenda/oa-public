"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = a11yButtonActionHandler;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/concat"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

function a11yButtonActionHandler(fn) {
  if (typeof fn !== 'function') {
    throw new Error("@a11yButtonActionHandler decorator can only be applied to function, not '".concat((0, _typeof2.default)(fn), "'"));
  }

  return function actionHandler() {
    var _context, _context2;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var event = args[0];

    if (!event || event.type === 'click' || (0, _includes.default)(_context = ['keydown', 'keypress']).call(_context, event.type) && (0, _includes.default)(_context2 = ['Enter', ' ']).call(_context2, event.key)) {
      var _context3;

      fn.call.apply(fn, (0, _concat.default)(_context3 = [this]).call(_context3, args));
    }
  };
}

module.exports = exports.default;
//# sourceMappingURL=a11yButtonActionHandler.js.map