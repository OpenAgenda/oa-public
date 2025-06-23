"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _reduce = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/reduce"));
var _text = _interopRequireDefault(require("./text"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
const DEFAULT_LANGUAGE = 'en';
var _default = exports.default = function _default() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _params.default)('multilingual', config, {
    field: false,
    defaultLanguage: null,
    forceCodesToLowerCase: true,
    languages: []
  });
  return Object.assign(origin => {
    const clean = {};
    const errors = [];
    const value = {};

    // if is provided with string, validator distributes value
    // to all languages
    if (typeof origin === 'string' && params.languages.length) {
      var _context;
      Object.assign(value, (0, _reduce.default)(_context = params.languages).call(_context, (c, l) => (0, _objectSpread2.default)((0, _objectSpread2.default)({}, c), {}, {
        [l]: origin
      }), {}));
    } else if (typeof origin === 'string') {
      Object.assign(value, {
        [params.defaultLanguage || DEFAULT_LANGUAGE]: origin
      });
    } else {
      Object.assign(value, origin || {});
    }

    // if languages have been pre-specified, they should be
    // part of validation and sanitizing
    if (Array.isArray(params.languages)) {
      params.languages.forEach(l => {
        value[l] = value[l] === undefined ? '' : value[l];
      });
    }
    if (!params.optional && !Object.keys(value).length) {
      throw (0, _errors.default)(params, undefined, 'required', 'at least one language entry is required');
    }
    if (!Object.keys(value).length && params.default !== undefined) {
      return params.default;
    }
    Object.keys(value).forEach(l => {
      const langValue = value[l];
      if (params.optional && (langValue === undefined || langValue === null)) {
        return;
      }
      try {
        const defaultValue = typeof params.default === 'string' ? params.default : ((params === null || params === void 0 ? void 0 : params.default) || {})[l];
        const validateText = (0, _text.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, params), {}, {
          default: defaultValue || null
        }));
        clean[params.forceCodesToLowerCase ? l.toLowerCase() : l] = validateText(langValue);
      } catch (lErrors) {
        lErrors.forEach(e => {
          errors.push((0, _objectSpread2.default)((0, _objectSpread2.default)({}, e), {}, {
            lang: l
          }));
        });
      }
    });
    if (errors.length) {
      throw errors;
    }
    return clean;
  }, {
    type: 'multilingual',
    field: params.field
  });
};
module.exports = exports.default;
//# sourceMappingURL=multilingual.js.map