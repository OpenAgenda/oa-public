import isEmail from 'validator/lib/isEmail';

import cleanParams from './lib/params';
import errors from './lib/errors';

import listify from './listify';

export default config => {
  const params = cleanParams('email', config, {
    optional: true
  });

  const validate = Object.assign(value => {
    const clean = typeof value === 'string' ? value.trim() : '';

    if (!value && params.optional) {
      return null;
    }

    if (clean.indexOf(' ') !== -1 || !isEmail(clean)) {
      throw errors(params, value, 'email.invalid', 'not an email');
    }

    if (clean.split('@').length > 2) {
      throw errors(params, value, 'email.invalid', 'not an email');
    }

    return clean;
  }, {
    type: 'email',
    field: params.field
  });

  return params.list ? listify(validate, params) : validate;
};
