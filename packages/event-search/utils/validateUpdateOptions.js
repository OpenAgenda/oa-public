'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const pass = require('@openagenda/validators/pass');
const choice = require('@openagenda/validators/choice');

schema.register({
  boolean,
  pass,
  choice,
});

module.exports = schema({
  refresh: {
    type: 'boolean',
    default: false,
  },
  formSchema: {
    type: 'pass',
    default: null,
  },
  operation: {
    type: 'choice',
    options: ['update', 'index'],
    default: 'update',
    unique: true,
  },
});
