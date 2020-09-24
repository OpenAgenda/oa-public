'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const streamValidator = require('@openagenda/validators/stream');
const validateStream = streamValidator({ optional: false });
schema.register({
  email: require('@openagenda/validators/email'),
  integer: require('@openagenda/validators/integer'),
  link: require('@openagenda/validators/link'),
  longitude: require('@openagenda/validators/longitude'),
  latitude: require('@openagenda/validators/latitude'),
  pass: require('@openagenda/validators/pass'),
  phone: require('@openagenda/validators/phone'),
  text: require('@openagenda/validators/text'),
  stream: streamValidator,
  multilingual: require('@openagenda/validators/multilingual')
});

const ValidationError = require('./ValidationError');

const fields = require('./fields.json');

const omitStringImage = v => typeof v.image === 'string' ? _.omit(v, ['image']) : v;

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
    isPatch,
    ignoreImage
  } = {
    isPatch: false,
    ignoreImage: false,
    ...options
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
}
