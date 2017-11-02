"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  boolean: require( '@openagenda/validators/boolean' ),
  email: require( '@openagenda/validators/email' )
} );

module.exports = schema( {
  id: {
    type: 'integer',
    optional: true
  },
  userId: {
    type: 'integer',
    optional: true
  },
  agendaId: {
    type: 'integer',
    optional: true
  },
  email: {
    type: 'email',
    optional: true
  }
} );