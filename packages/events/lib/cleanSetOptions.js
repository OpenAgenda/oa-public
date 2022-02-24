'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const boolean = require('@openagenda/validators/boolean');
const pass = require('@openagenda/validators/pass');

const fields = require('./fields');

schema.register({
  integer,
  boolean,
  pass
});

module.exports = schema({
  access: {
    type: 'text',
    default: 'public'
  },
  context: {
    type: 'pass',
    default: {}
  },
  draft: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  includeFields: {
    type: 'choice',
    options: fields.map(f => f.field),
  },
  transferToLegacy: {
    type: 'boolean',
    default: true
  },
  useProvidedIdentifiers: {
    type: 'boolean',
    default: false
  },
  private: {
    type: 'boolean',
    default: false
  },
  fileKey: {
    type: 'text'
  }
});
