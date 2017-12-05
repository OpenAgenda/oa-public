"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

module.exports = schema( {
  transferToLegacy: {
    type: 'boolean',
    default: false
  },
  context: {
    userUid: {
      type: 'integer',
      optional: true,
      default: null
    },
    agendaUid: {
      type: 'integer',
      optional: true,
      default: null
    }
  }
} );