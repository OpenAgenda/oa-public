'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');

const ValidationError = require('./ValidationError');

const eventCustomValidators = {
  timings: require('./validators/timings'),
  registration: require('./validators/registration'),
  accessibility: require('./validators/accessibility'),
  age: require('./validators/age'),
  stream: require('@openagenda/validators/stream')
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
    isDraft,
    convertDateMinuteHourTimings
  } = {
    isPatch: false,
    isDraft: false,
    convertDateMinuteHourTimings: false,
    ...options
  };

  const fn = isPatch || isDraft ? validate.part.bind(null, Object.keys(_.omit(data, ['draft']))) : validate;

  let clean;

  try {
    clean = fn(data);
  } catch (errors) {
    throw new ValidationError(errors);
  }

  return clean;
}
