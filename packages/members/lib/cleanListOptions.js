'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const pass = require('@openagenda/validators/pass');

schema.register({
  boolean,
  pass
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false
  },
  total: {
    type: 'boolean',
    default: false
  },
  legacy: {
    type: 'boolean',
    default: false
  },
  userOptions: {
    type: 'pass'
  }
});
