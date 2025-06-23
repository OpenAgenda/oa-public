"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _default = exports.default = function _default(validators) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const params = (0, _objectSpread2.default)({
    compact: false
  }, options);
  return Object.assign(function validate(valuesSet) {
    let errors = [];
    const clean = [];
    const compacted = {};
    validators.forEach(validator => {
      let matchingValue = valuesSet.filter(v => v.field === validator.field);
      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: undefined
      };
      try {
        clean.push({
          field: matchingValue.field,
          value: validator(matchingValue.value)
        });
      } catch (e) {
        errors = errors.concat(e);
      }
    });
    if (errors.length) {
      throw errors;
    }
    if (params.compact) {
      clean.forEach(c => {
        compacted[c.field] = c.value;
      });
      return compacted;
    }
    return clean;
  }, {
    type: 'set'
  });
};
module.exports = exports.default;
//# sourceMappingURL=set.js.map