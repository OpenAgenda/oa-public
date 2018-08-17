"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  integer: require( '@openagenda/validators/integer' )
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
  }
} );
