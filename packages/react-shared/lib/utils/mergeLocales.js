"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = mergeLocales;

var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/assign"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/for-each"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

function mergeLocales(target) {
  var output = (0, _objectSpread2.default)({}, target);

  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  var _loop = function _loop() {
    var _context;

    var source = _sources[_i];
    (0, _forEach.default)(_context = (0, _keys.default)(source)).call(_context, function (key) {
      if (!(key in output)) {
        output[key] = source[key];
      } else {
        output[key] = (0, _assign.default)(output[key], source[key]);
      }
    });
  };

  for (var _i = 0, _sources = sources; _i < _sources.length; _i++) {
    _loop();
  }

  return output;
}

module.exports = exports.default;
//# sourceMappingURL=mergeLocales.js.map