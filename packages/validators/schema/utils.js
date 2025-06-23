'use strict';

var _objectSpread = require("@babel/runtime-corejs3/helpers/objectSpread2").default;
const _ = {
  get: require('lodash/get'),
  pick: require('lodash/pick'),
  isArray: require('lodash/isArray')
};
const withFieldValueMatches = require('./withFieldValueMatches');
module.exports = {
  registerValidators,
  mapValuesToValidators,
  getDefault
};
const registeredValidators = {};
function mapValuesToValidators(fields, values, defaults) {
  const valuesWithDefaults = _objectSpread(_objectSpread({}, defaults || {}), values);
  return Object.keys(fields).map(fieldName => ({
    field: fieldName,
    validator: _makeValidator(_extractType(_.get(fields, fieldName)), fieldName, _.get(fields, fieldName),
    // options
    valuesWithDefaults, fields),
    value: _.get(values, fieldName),
    isEnabled: _isEnabled(valuesWithDefaults, fields, fields[fieldName])
  }));
}
function _isEnabled(valuesWithDefaults, fields) {
  let fieldOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!_.get(fieldOptions, 'enableWith')) {
    return true;
  }
  if (withFieldValueMatches(fieldOptions, 'enableWith', valuesWithDefaults, fields)) {
    return true;
  }
  return false;
}
function _makeValidator(type, field, options, values, fields) {
  const validatorOptions = _objectSpread({
    field
  }, options);
  if (type === 'list') {
    validatorOptions.validators = registeredValidators;
  }
  if (validatorOptions.enableWith && !withFieldValueMatches(validatorOptions, 'enableWith', values, fields)) {
    validatorOptions.optional = true;
  }
  const optionalIsUndefined = typeof validatorOptions.optional !== 'boolean';
  if (optionalIsUndefined && validatorOptions.optionalWith && !withFieldValueMatches(validatorOptions, 'optionalWith', values, fields)) {
    validatorOptions.optional = false;
  } else if (optionalIsUndefined && validatorOptions.optionalWith) {
    validatorOptions.optional = true;
  }
  const validate = registeredValidators[type](validatorOptions);
  if (typeof validate !== 'function') {
    throw new Error('There is no registered validator for field type ' + type);
  }
  return validate;
}
function getDefault(fields) {
  let clean = {};
  Object.keys(fields).forEach(k => {
    if (fields[k].type === 'schema') {
      clean[k] = fields[k].list ? [] : getDefault(fields[k].fields);
    } else {
      clean[k] = !('default' in fields[k]) ? null : fields[k].default;
    }
  });
  return clean;
}
function _extractType(fieldOptions) {
  if (typeof registeredValidators[fieldOptions.type] === 'undefined') {
    throw new Error('Unregistered type: ' + fieldOptions.type);
  }
  return fieldOptions.type;
}
function registerValidators(validators) {
  Object.assign(registeredValidators, validators);
}
//# sourceMappingURL=utils.js.map