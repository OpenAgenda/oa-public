"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = timezone;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _text = _interopRequireDefault(require("./text"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _listify = _interopRequireDefault(require("./listify"));
const timezoneRegex = /^[A-Z][a-zA-Z_]+\/[A-Z][A-Za-z_/]+$/;
function timezone() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _params.default)('timezone', config, {
    error: {
      code: 'timezone.invalid',
      message: 'value is not a Continent/City timezone'
    }
  });
  const validateText = (0, _text.default)((0, _omit.default)(params, ['list']));
  const validate = value => {
    var _context;
    let clean;
    try {
      clean = validateText(value);
    } catch (textErrors) {
      throw textErrors.map(e => (0, _objectSpread2.default)((0, _objectSpread2.default)({}, e), {}, {
        code: e.code.replace('text', 'timezone'),
        message: e.message.replace('text', 'timezone')
      }));
    }
    if ((0, _includes.default)(_context = [undefined, null]).call(_context, clean)) {
      return clean;
    }
    if (!timezoneRegex.test(value)) {
      throw (0, _errors.default)(params, value, 'timezone.invalid', 'must be in Continent/City format (e.g., Europe/Paris, America/New_York)');
    }
    return clean;
  };
  validate.type = 'integer';
  validate.field = params.field;
  return params.list ? (0, _listify.default)(validate, params) : validate;
}
module.exports = exports.default;
//# sourceMappingURL=timezone.js.map