"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  integer: require( '@openagenda/validators/integer' ),
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = schema( {
  transferToLegacy: {
    type: 'boolean',
    list: { default: false }
  },
  // required for legacy transfer to target an agenda
  agendaId: {
    type: 'integer',
    optional: true
  },
  draft: {
    type: 'boolean',
    optional: true,
    default: false
  },
  validate: {
    type: 'boolean',
    optional: true,
    default: true
  },
  preloaded: { // in case custom data is already in hand
    type: 'pass',
    optional: true
  }
} );
