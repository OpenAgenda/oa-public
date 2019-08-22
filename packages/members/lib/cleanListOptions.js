'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');

schema.register({
  boolean
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
  }
});
