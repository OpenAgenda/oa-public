import isIP from 'validator/lib/isIP.js';
import listify from './listify.js';
import cleanParams from './lib/params.js';
import errors from './lib/errors.js';

export default (config) => {
  const params = cleanParams('ip', config, {
    field: false,
    optional: true,
    default: undefined,
    list: false,
  });

  const validate = (value) => {
    if (
      value === undefined &&
      (params.default !== undefined || params.optional)
    ) {
      return params.default;
    }

    if (value === undefined) {
      throw errors(params, value, 'ip.required', 'an ip address is required');
    }

    if (!isIP(value)) {
      throw errors(params, value, 'ip.invalid', 'ip address is invalid');
    }

    return value;
  };

  const validator = Object.assign(validate, {
    type: 'ip',
    field: params.field,
  });

  return params.list ? listify(validator, params) : validator;
};
