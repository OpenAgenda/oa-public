import errors from './lib/errors';

export default (config = {}) => {
  const params = {
    field: false,
    optional: true,
    ...config
  };

  return Object.assign(value => {
    if (value === undefined && params.optional) {
      return null;
    }

    const clean = parseFloat(value);

    if (Number.isNaN(clean)) {
      throw errors(params, value, 'longitude.invalid', 'not a number');
    }

    if (clean < -180) {
      throw errors(params.field, value, 'longitude.toosmall', 'longitude cannot be less than -180');
    }

    if (clean > 180) {
      throw errors(params.field, value, 'longitude.toobig', 'longitude cannot be more than 180');
    }

    return clean;
  }, {
    type: 'longitude',
    field: params.field
  });
};
