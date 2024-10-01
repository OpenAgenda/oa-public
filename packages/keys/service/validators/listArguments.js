'use strict';

const schema = require('@openagenda/validators/schema');
const choice = require('@openagenda/validators/choice');
const text = require('@openagenda/validators/text');
const number = require('@openagenda/validators/number');
const pass = require('@openagenda/validators/pass');

schema.register({
  choice,
  text,
  number,
  pass,
});

module.exports = (args) => {
  const validate = schema({
    query: {
      type: 'pass',
    },
    offset: {
      type: 'number',
      default: 0,
    },
    limit: {
      type: 'number',
      default: 20,
    },
    options: {
      type: 'pass',
    },
  });

  return validate(args);
};
