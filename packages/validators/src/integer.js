import omit from 'lodash/omit.js';
import numberValidator from './number.js';
import cleanParams from './lib/params.js';
import errors from './lib/errors.js';

import listify from './listify.js';

export default (config = {}) => {
  const params = cleanParams('integer', config, {
    error: {
      code: 'integer.invalid',
      message: 'value is not an integer',
    },
  });

  const validateNumber = numberValidator(omit(params, ['list']));

  const validate = (value) => {
    let clean;

    try {
      clean = validateNumber(value);
    } catch (numberErrors) {
      throw numberErrors.map((e) => ({
        ...e,
        code: e.code.replace('number', 'integer'),
        message: e.message.replace('number', 'integer').replace(' a ', ' an '),
      }));
    }

    if ([undefined, null].includes(clean)) {
      return clean;
    }

    if (parseInt(clean, 10) !== parseFloat(clean)) {
      throw errors(params, value, 'integer.invalid', 'not an integer');
    }

    return clean;
  };

  validate.type = 'integer';
  validate.field = params.field;

  return params.list ? listify(validate, params) : validate;
};
