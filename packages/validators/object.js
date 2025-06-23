"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = object;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _listify = _interopRequireDefault(require("./listify"));
function object() {
  const options = arguments.length === 1 ? {} : arguments.length <= 0 ? undefined : arguments[0];
  const validators = arguments.length === 1 ? arguments.length <= 0 ? undefined : arguments[0] : arguments.length <= 1 ? undefined : arguments[1];
  const params = (0, _objectSpread2.default)({
    field: null,
    list: false
  }, options);
  const validate = values => {
    const errors = [];
    const clean = [];
    validators.forEach(validator => {
      let matchingValue = (values || []).filter(v => v.field === validator.field);
      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: validator.type === 'object' ? [] : undefined
      };
      if (validator.type !== 'object') {
        try {
          clean.push({
            field: matchingValue.field,
            value: validator(matchingValue.value)
          });
        } catch (caughtErrors) {
          [].concat(caughtErrors).forEach(error => errors.push(error));
        }
      } else if (typeof matchingValue.value !== 'object') {
        errors.push([{
          field: matchingValue.field,
          origin: matchingValue.value,
          code: 'object.invalidtype',
          message: 'not an object'
        }]);
      } else {
        try {
          validator(matchingValue.value).map(c => (0, _objectSpread2.default)((0, _objectSpread2.default)({}, c), {}, {
            field: "".concat(matchingValue.field, ".").concat(c.field)
          })).forEach(cleanItem => {
            clean.push(cleanItem);
          });
        } catch (caughtErrors) {
          caughtErrors.forEach(error => {
            errors.push((0, _objectSpread2.default)((0, _objectSpread2.default)({}, error), {}, {
              field: "".concat(matchingValue.field, ".").concat(error.field)
            }));
          });
        }
      }
    });
    if (errors.length) {
      throw errors;
    }
    return clean;
  };
  const validator = Object.assign(validate, {
    type: 'object',
    field: params.field
  });
  return params.list ? (0, _listify.default)(validator) : validator;
}
module.exports = exports.default;
//# sourceMappingURL=object.js.map