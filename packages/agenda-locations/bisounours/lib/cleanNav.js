'use strict';

const schema = require('@openagenda/validators/schema');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');

schema.register({
  integer,
  text
});

module.exports = schema({
  after: {
    type: 'integer',
    default: null
  },
  offset: {
    type: 'integer',
    default: null
  },
  limit: {
    type: 'integer',
    default: 20
  }
});
