'use strict';

const _ = require('lodash');

const schema = require('@openagenda/validators/schema');
const stream = require('@openagenda/validators/stream');
const email = require('@openagenda/validators/email');
const integer = require('@openagenda/validators/integer');
const link = require('@openagenda/validators/link');
const longitude = require('@openagenda/validators/longitude');
const latitude = require('@openagenda/validators/latitude');
const pass = require('@openagenda/validators/pass');
const phone = require('@openagenda/validators/phone');
const text = require('@openagenda/validators/text');
const multilingual = require('@openagenda/validators/multilingual');

schema.register({
  email,
  integer,
  link,
  longitude,
  latitude,
  pass,
  phone,
  text,
  stream,
  multilingual,
});

const validateStream = stream({ optional: false });

const ValidationError = require('./ValidationError');

const fields = require('./fields.json');

const validate = schema(
  fields
    .filter(field => field.write.includes('contributor'))
    .reduce(
      (sch, field) => ({
        ...sch,
        [field.field]: _.omit(field, ['field', 'db', 'read']),
      }),
      {}
    )
);

module.exports = (values, options = {}) => {
  const { isPatch, ignoreImage } = {
    isPatch: false,
    ignoreImage: false,
    ...options,
  };

  const fn = isPatch ? validate.part.bind(null, Object.keys(values)) : validate;

  try {
    return fn(ignoreImage ? _.omit(values, ['image']) : values);
  } catch (errors) {
    throw new ValidationError(errors);
  }
};

module.exports.isStream = v => {
  try {
    validateStream(v);
  } catch (e) {
    return false;
  }
  return true;
};
