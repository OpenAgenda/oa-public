import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import textValidator from '@openagenda/validators/text';
import integerValidator from '@openagenda/validators/integer';
import latitudeValidator from '@openagenda/validators/latitude';
import longitudeValidator from '@openagenda/validators/longitude';

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

export default (options) => (value) => {
  const optional = _.get(options, 'optional', true);

  if (optional && value === undefined) {
    return _.get(options, 'default');
  }

  if (optional && value === null) {
    return null;
  }

  try {
    return (optional ? validateDraft : validate)(value);
  } catch (errors) {
    throw errors.map((e) => ({
      ...e,
      field: 'location',
      code: `location.${e.code}`,
    }));
  }
};
