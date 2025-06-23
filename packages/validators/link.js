"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _url = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/url"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _isString = _interopRequireDefault(require("lodash/isString"));
var _listify = _interopRequireDefault(require("./listify"));
var _email = _interopRequireDefault(require("./email"));
var _params = _interopRequireDefault(require("./lib/params"));
const validateEmail = (0, _email.default)();
const isEmail = v => {
  try {
    validateEmail(v);
  } catch (e) {
    return false;
  }
  return true;
};
var _default = config => {
  const params = (0, _params.default)('link', config, {
    error: {
      code: 'link.invalid',
      message: 'value is not a link'
    }
  });
  const shouldntMatch = [/\s/, /\/:/, /;/];
  const validate = value => {
    const templateError = {
      field: params.field,
      code: 'link.invalid',
      message: 'value is not a link'
    };
    let clean = value;
    const error = [(0, _objectSpread2.default)({
      origin: value
    }, templateError)];
    if ((0, _isString.default)(value)) {
      clean = (0, _trim.default)(value).call(value);
      // Normalize protocol to lowercase
      clean = clean.replace(/^(HTTP|HTTPS):/i, match => match.toLowerCase());
    }
    if ((!value || !value.length) && !(value instanceof Object) && params.optional) {
      return params.default !== undefined ? params.default : clean;
    }
    if (/^mailto:/.test(clean) && isEmail(clean.replace(/^mailto:/, ''))) {
      return clean;
    }
    const startsWithProtocol = /^((http(s|):|)\/\/|mailto:)/.test(clean);
    if (!startsWithProtocol && isEmail(clean)) throw error;

    // add http:// if link is like www.google.com (protocol missing)
    if (!startsWithProtocol) {
      clean = "http://".concat(clean);
    }
    if (clean.indexOf('.') === -1) {
      throw error;
    }
    if (clean.substr(clean.length - 1, 1) === '.') {
      throw error;
    }
    shouldntMatch.forEach(rgx => {
      if (rgx.test(clean)) {
        throw error;
      }
    });

    // Use native URL constructor for validation
    try {
      // Handle protocol-relative URLs by adding a temporary protocol
      const urlToTest = clean.startsWith('//') ? "http:".concat(clean) : clean;
      // eslint-disable-next-line no-unused-vars
      const url = new _url.default(urlToTest);
    } catch (e) {
      throw error;
    }
    return clean;
  };
  validate.type = 'link';
  validate.field = params.field;
  return params.list ? (0, _listify.default)(validate, params) : validate;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=link.js.map