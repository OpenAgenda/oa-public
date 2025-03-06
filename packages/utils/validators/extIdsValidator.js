'use strict';

const schema = require('@openagenda/validators/schema/index');
const text = require('@openagenda/validators/text');

schema.register({ text });

const validate = schema({
  list: true,
  fields: {
    key: { type: 'text', optional: false, max: 32 },
    value: { type: 'text', optional: true, max: 100 },
  },
});

module.exports = (options = {}) =>
  (value) => {
    if ([undefined, null].includes(value) && options.optional) {
      return value;
    }

    return validate(value);
  };
