'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');

const ValidationError = require('./ValidationError');
const preClean = require('./preValidateClean');

const eventCustomValidators = {
  timings2: require('./validators/timings'),
  registration: require('./validators/registration'),
  accessibility: require('./validators/accessibility'),
  age: require('./validators/age'),
  stream: require('@openagenda/validators/stream'),
  keywords: require('./validators/keywords')
};

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');

const fields = require('./fields');

const validate = new FormSchema({
  fields: fields.filter(f => (f.write || []).includes('public')),
  custom: eventCustomValidators
}).getValidate();

module.exports = (data, options = {}) => {
  const {
    isPatch,
    isDraft
  } = {
    isPatch: false,
    isDraft: false,
    ...options
  };

  const fn = isPatch || isDraft ? validate.part.bind(null, Object.keys(_.omit(data, ['draft']))) : validate;

  let clean;

  try {
    clean = fn(preClean(data));
  } catch (errors) {
    throw new ValidationError(errors);
  }

  return clean;
}

