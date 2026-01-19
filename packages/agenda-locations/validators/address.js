'use strict';

const linkValidator = require('@openagenda/validators/link');
const textValidator = require('@openagenda/validators/text');

module.exports = (config = {}) => {
  const link = linkValidator();
  const text = textValidator(config);

  const validate = (value) => {
    // Check if value is a URL
    let isURL = false;
    try {
      link(value);
      isURL = true;
    } catch (linkError) {
      // Not a URL, which is good for an address
    }

    if (isURL) {
      const error = [
        {
          origin: value,
          field: config.field,
          code: 'address.invalid',
          message: 'address should not be a URL',
        },
      ];
      throw error;
    }

    return text(value);
  };

  validate.type = 'address';
  validate.field = config.field;

  return validate;
};
