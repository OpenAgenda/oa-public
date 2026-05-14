import omit from 'lodash/omit.js';
import textValidator from './text.js';
import cleanParams from './lib/params.js';
import errors from './lib/errors.js';

import listify from './listify.js';

const timezoneRegex = /^[A-Z][a-zA-Z_]+\/[A-Z][A-Za-z_/]+$/;

export default function timezone(config = {}) {
  const params = cleanParams('timezone', config, {
    error: {
      code: 'timezone.invalid',
      message: 'value is not a Continent/City timezone',
    },
  });

  const validateText = textValidator(omit(params, ['list']));

  const validate = (value) => {
    let clean;

    try {
      clean = validateText(value);
    } catch (textErrors) {
      throw textErrors.map((e) => ({
        ...e,
        code: e.code.replace('text', 'timezone'),
        message: e.message.replace('text', 'timezone'),
      }));
    }

    if ([undefined, null].includes(clean)) {
      return clean;
    }

    if (!timezoneRegex.test(value)) {
      throw errors(
        params,
        value,
        'timezone.invalid',
        'must be in Continent/City format (e.g., Europe/Paris, America/New_York)',
      );
    }
    return clean;
  };
  validate.type = 'integer';
  validate.field = params.field;

  return params.list ? listify(validate, params) : validate;
}
