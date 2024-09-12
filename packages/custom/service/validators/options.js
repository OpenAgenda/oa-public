'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const pass = require('@openagenda/validators/pass');

schema.register({
  boolean,
  integer,
  pass,
});

module.exports = schema({
  transferToLegacy: {
    type: 'boolean',
    list: { default: false },
  },
  // required for legacy transfer to target an agenda
  agendaId: {
    type: 'integer',
    optional: true,
  },
  draft: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  validate: {
    type: 'boolean',
    optional: true,
    default: true,
  },
  partial: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  preloaded: {
    // in case custom data is already in hand
    type: 'pass',
    optional: true,
  },
});
