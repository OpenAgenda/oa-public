'use strict';

const _ = {
  get: require('lodash/get'),
  pick: require('lodash/pick'),
  isArray: require('lodash/isArray')
}

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
      valuesWithDefaults
   ),
    value: _extractValue(_.get(values, fieldName), values, valuesWithDefaults, fields[fieldName])
  }));
}


function _extractValue(value, values, valuesWithDefaults, fieldOptions = {}) {
  if (!_.get(fieldOptions, 'enableWith')) {
    return value;
  }

  if (_withFieldValueMatches(fieldOptions, 'enableWith', valuesWithDefaults)) {
    return value;
  }

  return null;
}


function _withFieldValueMatches(fieldOptions, withKey, values) {
  const withParams = _.get(fieldOptions, withKey);

  const withField = typeof withParams === 'string' ? withParams : withParams.field;
  const value = values === undefined ? undefined : values[withField];

  const evaluateRefFieldAsTruthy = typeof withParams === 'string';

  if (evaluateRefFieldAsTruthy && (value instanceof Array) && !value.length) {
    return false;
  } else if (evaluateRefFieldAsTruthy && [undefined, null].includes(value)) {
    return false;
  } else if (evaluateRefFieldAsTruthy) {
    return true;
  }

  if (value instanceof Array) {
    return value.includes(withParams.value);
  }

  return [].concat(value).filter(v => [].concat(withParams.value).includes(v)).length;
}

function _makeValidator(type, field, options, values) {
  const validatorOptions = {
    field,
    ...options
  };

  if (type === 'list') {
    validatorOptions.validators = registeredValidators;
  }
  
  if (
    validatorOptions.enableWith && 
    !_withFieldValueMatches(validatorOptions, 'enableWith', values)
  ) {
    validatorOptions.optional = true;
  }

  const optionalIsUndefined = typeof validatorOptions.optional !== 'boolean';

  if (
    optionalIsUndefined &&
    validatorOptions.optionalWith && 
    !_withFieldValueMatches(validatorOptions, 'optionalWith', values)
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
