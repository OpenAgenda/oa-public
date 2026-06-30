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

  // Required field: a draft persists an empty location as `null`, so the
  // schema default (which is only substituted when the `location` key is
  // absent) never kicks in and validation fails with "location.required".
  // Fall back to the configured default so publishing a draft validates the
  // same way as creating an event directly.
  const effectiveValue = !optional && (value === undefined || value === null)
    ? _.get(options, 'default', value)
    : value;

  try {
    return (optional ? validateDraft : validate)(effectiveValue);
  } catch (errors) {
    throw errors.map((e) => ({
      ...e,
      field: 'location',
      code: `location.${e.code}`,
    }));
  }
};
