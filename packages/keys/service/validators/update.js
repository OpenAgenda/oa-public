'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');

schema.register({
  text,
});

module.exports = (data) => {
  const validate = schema({
    label: {
      type: 'text',
      max: 255,
      default: null,
    },
  });

  return validate(data);
};
