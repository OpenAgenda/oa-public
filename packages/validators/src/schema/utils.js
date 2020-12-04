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
  const enableWith = _.get(fieldOptions, 'enableWith');

  if (!enableWith) {
    return value;
  }

  if (_enableWithFieldValueMatches(enableWith, valuesWithDefaults)) {
    return value;
  }

  return null;
}


function _enableWithFieldValueMatches(enableWith, values) {
  const enableWithField = typeof enableWith === 'string' ? enableWith : enableWith.field;
  const value = values === undefined ? undefined : values[enableWithField];

  const evaluateRefFieldAsTruthy = typeof enableWith === 'string';

  if (evaluateRefFieldAsTruthy && (value instanceof Array) && !value.length) {
    return false;
  } else if (evaluateRefFieldAsTruthy && [undefined, null].includes(value)) {
    return false;
  } else if (evaluateRefFieldAsTruthy) {
    return true;
  }

  if (value instanceof Array) {
    return value.includes(enableWith.value);
  }

  return [].concat(value).filter(v => [].concat(enableWith.value).includes(v)).length;
}

function _makeValidator(type, field, options, values) {
  const validatorOptions = {
    field,
    ...options
  };

  if (type === 'list') {
    validatorOptions.validators = registeredValidators;
  }

  if (validatorOptions.enableWith && !_enableWithFieldValueMatches(validatorOptions.enableWith, values)) {
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
