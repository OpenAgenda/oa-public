'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
schema.register({
  email: require('@openagenda/validators/email'),
  integer: require('@openagenda/validators/integer'),
  link: require('@openagenda/validators/link'),
  longitude: require('@openagenda/validators/longitude'),
  latitude: require('@openagenda/validators/latitude'),
  pass: require('@openagenda/validators/pass'),
  phone: require('@openagenda/validators/phone'),
  text: require('@openagenda/validators/text'),
  multilingual: require('@openagenda/validators/multilingual')
});

const ValidationError = require('./ValidationError');

const fields = require('./fields.json');

const validate = schema(fields
  .filter(field => {
    // keep this basic for now.
    return field.write.includes('contributor')
  })
  .reduce((schema, field) => ({
    ...schema,
    [field.field]: _.omit(field, ['field', 'db', 'read'])
  }), {}));

module.exports = (values, options = {}) => {
  const {
    isPatch
  } = {
    isPatch: false,
    ...options
  };

  const fn = isPatch ? validate.part.bind(null, Object.keys(values)) : validate;

  try {
    return fn(values);
  } catch (errors) {
    throw new ValidationError(errors);
  }
};
