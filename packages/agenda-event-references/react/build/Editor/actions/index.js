"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _search = _interopRequireDefault(require("./search"));

var _events = _interopRequireDefault(require("./events"));

var _suggestions = _interopRequireDefault(require("./suggestions"));

var _utils = _interopRequireDefault(require("@openagenda/utils"));

var actions = _utils.default.extend({}, _search.default, _events.default, _suggestions.default);

var _default = actions;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map