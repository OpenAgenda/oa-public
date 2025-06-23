"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = exports.default = function _default() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _params.default)('boolean', config, {
    default: undefined,
    optional: true,
    allowNull: false
  });
  return Object.assign(value => {
    const isUndefined = value === undefined;
    const hasDefault = params.default !== undefined;
    if (isUndefined && !params.optional && !hasDefault) {
      throw (0, _errors.default)(params, value, 'required', 'a boolean is required');
    }
    if (isUndefined && hasDefault) {
      return params.default !== null ? !!params.default : null;
    }
    if (isUndefined) {
      return;
    }
    if (value === null && (params.default === null || params.allowNull)) {
      return null;
    }
    if (['0', 'false', false].indexOf(value) !== -1) {
      return false;
    }
    return !!value;
  }, {
    type: 'boolean',
    field: params.field
  });
};
module.exports = exports.default;
//# sourceMappingURL=boolean.js.map