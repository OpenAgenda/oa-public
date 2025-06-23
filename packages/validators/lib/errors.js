"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = function _default(params, value, code, message) {
  const error = {
    origin: value,
    code,
    message
  };
  if (params.field) {
    error.field = params.field;
  }
  for (var _len = arguments.length, args = new Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
    args[_key - 4] = arguments[_key];
  }
  if (args.length) {
    Object.assign.apply(null, [error].concat(args));
  }
  return [error];
};
module.exports = exports.default;
//# sourceMappingURL=errors.js.map