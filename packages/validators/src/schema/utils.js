import _ from 'lodash';
import withFieldValueMatches from './withFieldValueMatches';

const registeredValidators = {};

function _extractType(fieldOptions) {
  if (typeof registeredValidators[fieldOptions.type] === 'undefined') {
    throw new Error(`Unregistered type: ${fieldOptions.type}`);
  }

  return fieldOptions.type;
}

function registerValidators(validators) {
  Object.assign(registeredValidators, validators);
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

function mapValuesToValidators(fields, values, defaults) {
  const valuesWithDefaults = {
    ...defaults || {},
    ...values,
  };

  return Object.keys(fields).map((fieldName) => {
    const validatorOptions = _.get(fields, fieldName);
    return {
      field: fieldName,
      validator: _makeValidator(
        _extractType(_.get(fields, fieldName)),
        fieldName,
        validatorOptions,
        valuesWithDefaults,
        fields
      ),
      value: _.get(values, fieldName),
      related: Object.keys(validatorOptions.related ?? {}).reduce((rootCarry, relatedKey) => ({
        ...rootCarry,
        ...(validatorOptions.related[relatedKey] ?? []).reduce((carry, relatedField) => ({
          ...carry,
          [relatedField]: values?.[relatedField]
        }), {}),
      }), {}),
      isEnabled: _isEnabled(valuesWithDefaults, fields, fields[fieldName]),
    };
  });
}


function _isEnabled(valuesWithDefaults, fields, fieldOptions = {}) {
  if (!fieldOptions?.enableWith) {
    return true;
  }

  if (withFieldValueMatches(fieldOptions, 'enableWith', valuesWithDefaults, fields)) {
    return true;
  }

  return false;
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

export default {
  registerValidators,
  mapValuesToValidators,
  getDefault
}