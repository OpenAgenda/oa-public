'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer,
});

module.exports = schema({
  after: {
    type: 'integer',
    default: 0,
  },
  size: {
    type: 'text',
    default: 20,
    min: 0,
    max: 300,
  },
});
