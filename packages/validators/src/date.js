import cleanParams from './lib/params';
import errors from './lib/errors';

export default config => {
  const params = cleanParams('date', config, {
    field: false,
    min: undefined,
    max: undefined,
    default: undefined,
    optional: true
  });

  return Object.assign(value => {
    let clean;
    const isUndefinedOrNull = [undefined, null].includes(value);

    if (isUndefinedOrNull && params.default === 'now') {
      return new Date();
    }

    if (isUndefinedOrNull && params.default === null) {
      return null;
    }

    if (isUndefinedOrNull && params.default instanceof Date) {
      return new Date(params.default.getTime());
    }

    if (isUndefinedOrNull && !params.optional) {
      throw errors(params, value, 'date.required', 'a date is required');
    }

    if (isUndefinedOrNull) {
      return value;
    }

    if (typeof value === 'string') {
      clean = new Date(value);

      if (clean.toString() === 'Invalid Date') {
        throw errors(params, value, 'date.invalid', 'not a date');
      }
    } else if (value instanceof Date) {
      clean = new Date(value.getTime());
    } else {
      throw errors(params, value, 'date.invalid', 'not a date');
    }

    if (params.min && clean < params.min) {
      throw errors(params, value, 'date.toosmall', 'date is too small', {
        values: {
          min: params.min
        }
      });
    }

    if (params.max && clean > params.max) {
      throw errors(params, value, 'date.toobig', 'date is too big', {
        values: {
          max: params.max
        }
      });
    }

    return clean;
  }, {
    type: 'date',
    field: params.field
  });
};
