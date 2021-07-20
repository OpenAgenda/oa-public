import errors from './lib/errors';

export default (config = {}) => {
  const params = {
    optional: false,
    field: false, // required
    regex: false, // required
    error: { // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    clean: false, // if true result of regex is clean value
    trim: true,
    type: false,
    min: null,
    max: null,
    ...config
  };

  const validator = value => {
    let clean = value ? (`${value}`) : value;

    if (params.optional && (!clean || !clean.length)) {
      return 'default' in params ? params.default : clean;
    }

    if (!params.optional && !clean) {
      throw errors(
        params,
        value,
        'required',
        'value must not be empty'
      );
    }

    if (typeof clean === 'string' && params.trim) {
      clean = clean.trim();
    }

    if (params.min !== null && clean.length < params.min) {
      throw errors(
        params,
        value,
        'toosmall',
        'value is too short'
      );
    }

    if (params.max !== null && clean.length > params.max) {
      throw errors(
        params,
        value,
        'too long',
        'value is too long'
      );
    }

    if (!params.regex.test(clean)) {
      throw errors(params, value, params.error.code, params.error.message);
    }

    return params.clean ? clean.match(params.regex)[0] : clean;
  };

  if (params.type) {
    validator.type = params.type;
  }

  if (params.field) {
    validator.field = params.field;
  }

  return validator;
};
