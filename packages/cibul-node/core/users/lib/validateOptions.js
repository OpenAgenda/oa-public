'use strict';

const schema = require('@openagenda/validators/schema');
const booleanValidator = require('@openagenda/validators/boolean');

schema.register({
  boolean: booleanValidator,
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false,
  },
});
