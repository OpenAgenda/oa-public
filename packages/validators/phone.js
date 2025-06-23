"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regex = _interopRequireDefault(require("./regex"));
const PHONE_REGEX = /^(\+|)([\d\s.-]|\([\d\s]\))+$/;
var _default = exports.default = function _default() {
  var _config$optional, _config$default;
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (0, _regex.default)({
    optional: (_config$optional = config === null || config === void 0 ? void 0 : config.optional) !== null && _config$optional !== void 0 ? _config$optional : true,
    field: config === null || config === void 0 ? void 0 : config.field,
    default: (_config$default = config === null || config === void 0 ? void 0 : config.default) !== null && _config$default !== void 0 ? _config$default : null,
    regex: PHONE_REGEX,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number'
    },
    type: 'phone'
  });
};
module.exports = exports.default;
//# sourceMappingURL=phone.js.map