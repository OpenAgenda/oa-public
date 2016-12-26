"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' )
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
  }
} );