'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');

schema.register({
  boolean
});

module.exports = schema({
  total: {
    type: 'boolean',
    default: false
  }
});
