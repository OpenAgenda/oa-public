'use strict';

const _ = {
  get: require('lodash/get'),
  pick: require('lodash/pick'),
  isArray: require('lodash/isArray')
}

const withFieldValueMatches = require('./withFieldValueMatches');

module.exports = {
  registerValidators,
  mapValuesToValidators,
  getDefault
}

const registeredValidators = {};

function mapValuesToValidators(fields, values, defaults) {
  const valuesWithDefaults = {
    ...(defaults || {}),
    ...values
  };

  return Object.keys(fields).map(fieldName => ({
    field: fieldName,
    validator: _makeValidator(
      _extractType(_.get(fields, fieldName)),
      fieldName,
      _.get(fields, fieldName), // options
      valuesWithDefaults,
      fields
   ),
    value: _extractValue(_.get(values, fieldName), values, valuesWithDefaults, fields, fields[fieldName])
  }));
}


function _extractValue(value, values, valuesWithDefaults, fields, fieldOptions = {}) {
  if (!_.get(fieldOptions, 'enableWith')) {
    return value;
  }

  if (withFieldValueMatches(fieldOptions, 'enableWith', valuesWithDefaults, fields)) {
    return value;
  }

  return null;
}

function _makeValidator(type, field, options, values, fields) {
  const validatorOptions = {
    field,
    ...options
  };

  if (type === 'list') {
    validatorOptions.validators = registeredValidators;
  }
  
  if (
    validatorOptions.enableWith && 
    !withFieldValueMatches(validatorOptions, 'enableWith', values, fields)
  ) {
    validatorOptions.optional = true;
  }

  const optionalIsUndefined = typeof validatorOptions.optional !== 'boolean';

  if (
    optionalIsUndefined &&
    validatorOptions.optionalWith && 
    !withFieldValueMatches(validatorOptions, 'optionalWith', values, fields)
  ) {
    validatorOptions.optional = false;
  } else if (
    optionalIsUndefined &&
    validatorOptions.optionalWith
  ) {
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
