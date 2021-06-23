'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  boolean: require('@openagenda/validators/boolean'),
  pass: require('@openagenda/validators/pass'),
  choice: require('@openagenda/validators/choice')
});

module.exports = schema({
  refresh: {
    type: 'boolean',
    default: false
  },
  formSchema: {
    type: 'pass',
    default: null
  },
  operation: {
    type: 'choice',
    options: ['update', 'index'],
    default: 'update',
    unique: true
  }
});