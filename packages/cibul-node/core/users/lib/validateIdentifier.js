'use strict';

const schema = require('@openagenda/validators/schema');
const integerValidator = require('@openagenda/validators/integer');
const textValidator = require('@openagenda/validators/text');

schema.register({
  integer: integerValidator,
  text: textValidator,
});

const validate = schema({
  uid: {
    type: 'integer',
    optional: true,
  },
  secretKey: {
    type: 'text',
    optional: true,
  },
});

module.exports = (dirty, options = {}) => {
  const clean = validate(dirty instanceof Object ? dirty : { uid: dirty });

  if (options.pickOne) {
    const field = Object.keys(clean).filter(key => !!clean[key])[0];
    return {
      [field]: clean[field],
    };
  }

  return clean;
};
