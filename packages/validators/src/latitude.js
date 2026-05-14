import errors from './lib/errors.js';

export default function latitude(config = {}) {
  const params = {
    field: false,
    optional: true,
    ...config,
  };

  function validate(value) {
    if (value === undefined && params.optional) {
      return null;
    }

    const clean = parseFloat(value);

    if (Number.isNaN(clean)) {
      throw errors(params, value, 'latitude.invalid', 'not a number');
    }

    if (clean < -90) {
      throw errors(
        params,
        value,
        'latitude.toosmall',
        'latitude cannot be less than -90',
      );
    }

    if (clean > 90) {
      throw errors(
        params,
        value,
        'latitude.toobig',
        'latitude cannot be more than 90',
      );
    }

    return clean;
  }

  return Object.assign(validate, {
    field: params.field,
    type: 'latitude',
  });
}
