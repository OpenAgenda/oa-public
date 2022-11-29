const _ = require('lodash');

const schema = require('@openagenda/validators/schema');

const textValidator = require('@openagenda/validators/text');
const integerValidator = require('@openagenda/validators/integer');
const latitudeValidator = require('@openagenda/validators/latitude');
const longitudeValidator = require('@openagenda/validators/longitude');

schema.register({
  text: textValidator,
  integer: integerValidator,
  latitude: latitudeValidator,
  longitude: longitudeValidator,
});

const locationSchema = {
  uid: {
    type: 'integer',
    optional: false,
  },
  name: {
    type: 'text',
  },
  address: {
    type: 'text',
  },
  latitude: {
    type: 'latitude',
  },
  longitude: {
    type: 'longitude',
  },
  timezone: {
    type: 'text',
  },
};

const validate = schema(locationSchema);
const validateDraft = schema({
  ...locationSchema,
  uid: {
    type: 'integer',
  },
});

module.exports = options => value => {
  const optional = _.get(options, 'optional', true);

  if (optional && !value) {
    return _.get(options, 'default');
  }

  try {
    return (optional ? validateDraft : validate)(value);
  } catch (errors) {
    throw errors.map(e => ({
      ...e,
      field: 'location',
      code: `location.${e.code}`,
    }));
  }
};
