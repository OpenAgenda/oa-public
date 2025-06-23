"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _number = _interopRequireDefault(require("./number"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _listify = _interopRequireDefault(require("./listify"));
var _default = exports.default = function _default() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _params.default)('integer', config, {
    error: {
      code: 'integer.invalid',
      message: 'value is not an integer'
    }
  });
  const validateNumber = (0, _number.default)((0, _omit.default)(params, ['list']));
  const validate = value => {
    var _context;
    let clean;
    try {
      clean = validateNumber(value);
    } catch (numberErrors) {
      throw numberErrors.map(e => (0, _objectSpread2.default)((0, _objectSpread2.default)({}, e), {}, {
        code: e.code.replace('number', 'integer'),
        message: e.message.replace('number', 'integer').replace(' a ', ' an ')
      }));
    }
    if ((0, _includes.default)(_context = [undefined, null]).call(_context, clean)) {
      return clean;
    }
    if (parseInt(clean, 10) !== parseFloat(clean)) {
      throw (0, _errors.default)(params, value, 'integer.invalid', 'not an integer');
    }
    return clean;
  };
  validate.type = 'integer';
  validate.field = params.field;
  return params.list ? (0, _listify.default)(validate, params) : validate;
};
module.exports = exports.default;
//# sourceMappingURL=integer.js.map