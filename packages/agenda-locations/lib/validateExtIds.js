'use strict';

const schema = require('@openagenda/validators/schema/index');
const text = require('@openagenda/validators/text');

schema.register({ text });

const validate = schema({
  list: true,
  fields: {
    key: { type: 'text', optional: false },
    value: { type: 'text', optional: false },
  },
});

module.exports = (options = {}) =>
  (value) => {
    if ([undefined, null].includes(value) && options.optional) {
      return value;
    }
    return validate(value);
  };
