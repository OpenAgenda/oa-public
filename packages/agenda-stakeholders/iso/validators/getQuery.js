"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' ),
  email: require( 'validators/email' )
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