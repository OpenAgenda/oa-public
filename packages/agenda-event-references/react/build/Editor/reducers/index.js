"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _search = _interopRequireDefault(require("./search"));

var _events = _interopRequireDefault(require("./events"));

var _suggestions = _interopRequireDefault(require("./suggestions"));

var _immutabilityHelper = _interopRequireDefault(require("immutability-helper"));

var _default = function _default() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;
  var newState = (0, _search.default)(state, action);
  newState = (0, _events.default)(newState, action);
  newState = (0, _suggestions.default)(newState, action);
  return newState;
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map