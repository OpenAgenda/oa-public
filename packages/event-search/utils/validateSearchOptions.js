'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  pass: require('@openagenda/validators/pass'),
  choice: require('@openagenda/validators/choice')
});

module.exports = schema({
  detailed: {
    type: 'boolean',
    default: false
  },
  formSchema: {
    type: 'pass',
  },
  aggregations: {
    list: { default: null },
    type: 'pass' // aggregations are cleaned separately - see aggregation/index
  },
  first: { // return first result only
    type: 'boolean',
    default: false
  },
  monolingual: {
    type: 'text',
    default: null,
    max: 2
  },
  access: {
    type: 'text',
    default: 'public',
    optional: true
  },
  includeFields: {
    type: 'text',
    optional: true,
    list: { default: null }
  },
  includeLabels: {
    type: 'boolean',
    optional: true,
    default: false
  },
  useAfterKey: {
    type: 'boolean',
    optional: true,
    default: false
  },
  parser: {
    type: 'pass'
  }
});
