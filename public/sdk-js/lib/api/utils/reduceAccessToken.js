"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reduceAccessToken;
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
function reduceAccessToken(token) {
  var _context;
  return (0, _reduce.default)(_context = token.split('')).call(_context, (accu, next) => accu + next.charCodeAt(0), 0);
}
module.exports = exports.default;
//# sourceMappingURL=reduceAccessToken.js.map