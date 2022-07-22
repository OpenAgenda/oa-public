'use strict';

const schema = require('@openagenda/validators/schema');
const booleanValidator = require('@openagenda/validators/boolean');
const passValidator = require('@openagenda/validators/pass');
const textValidator = require('@openagenda/validators/text');

schema.register({
  boolean: booleanValidator,
  pass: passValidator,
  text: textValidator
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false
  },
  aggregations: {
    type: 'pass',
    default: null
  },
  useAfterKey: {
    type: 'boolean',
    default: false
  },
  monolingual: {
    type: 'text',
    max: 2
  },
  access: {
    type: 'text'
  },
  parser: {
    type: 'pass'
  },
  includeFields: {
    type: 'text',
    list: { default: null }
  },
  includeLabels: {
    type: 'boolean',
    default: false,
  },
  includeImageTimestamps: {
    type: 'boolean',
    default: false
  }
});
