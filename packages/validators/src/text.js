import listify from './listify';
import cleanParams from './lib/params';
import errors from './lib/errors';

export default config => {
  const params = cleanParams('text', config, {
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true,
    default: null,
    list: false,
    strict: false,
    emptyStringAsUndefined : true,
  }, config || {});

  const validate = value => {
    let clean = [undefined, null].includes(value) ? '' : `${value}`;

    if (typeof value === 'object' && clean) {
      throw errors(params, value, 'string.invalidtype', 'not a string');
    }

    if (value !== undefined && typeof value !== 'string' && params.strict) {
      throw errors(params, value, 'string.invalidtype', 'not a string');
    }

    if (params.trim) {
      clean = clean.trim();
    }

    if (value === undefined || value === null ||
      (!clean.length && params.emptyStringAsUndefined )) {
      if (params.optional || ![undefined, null].includes(params.default)) {
        return params.default;
      }
      throw errors(params, value, 'required', 'a string is required');
    }

    if (clean.length < params.min) {
      throw errors(
        params,
        value,
        'string.tooshort',
        'the string is too short',
        {
          values: {
            min: params.min,
            max: params.max
          }
        }
      );
    }

    if (clean.length > params.max) {
      throw errors(
        params,
        value,
        'string.toolong',
        'the string is too long',
        {
          values: {
            min: params.min,
            max: params.max
          }
        }
      );
    }

    return clean;
  };

  const validator = Object.assign(validate, {
    type: 'text',
    field: params.field
  });

  return params.list ? listify(validator, params) : validator;
};
