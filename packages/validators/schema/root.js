"use strict";

var _ = {
  extend: require('lodash/extend')
};

module.exports = {
  registerValidators: registerValidators,
  getFlat: getFlat,
  getDefault: getDefault
};

var registeredValidators = {};

function getFlat(fields, values) {

  return Object.keys(fields).map(function (f) {

    var fieldOptions = fields[f],
        type = _extractType(fieldOptions);

    return {
      field: f,
      validator: _makeValidator(type, f, fieldOptions),
      value: (values || {})[f]
    };
  });
}

function _makeValidator(type, field, options) {

  var validatorOptions = _.extend({ field: field }, options);

  if (type === 'list') {

    validatorOptions.validators = registeredValidators;
  }

  return registeredValidators[type](validatorOptions);
}

function getDefault(fields) {

  var clean = {};

  Object.keys(fields).forEach(function (k) {

    if (fields[k].type === 'schema') {

      clean[k] = fields[k].list ? [] : getDefault(fields[k].fields);
    } else {

      clean[k] = fields[k]['default'] === undefined ? null : fields[k]['default'];
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

  _.extend(registeredValidators, validators);
}
//# sourceMappingURL=root.js.map