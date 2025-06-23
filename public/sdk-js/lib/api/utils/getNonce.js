"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getNonce;
var _random2 = _interopRequireDefault(require("lodash/random.js"));
function getNonce(reducedAccessToken, requestTokenTime) {
  const ms = new Date().getTime() - requestTokenTime;
  return parseInt("".concat((0, _random2.default)(10 ** 3)).concat(reducedAccessToken).concat(ms), 10);
}
module.exports = exports.default;
//# sourceMappingURL=getNonce.js.map