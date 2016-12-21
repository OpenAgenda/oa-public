"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' )
} )

module.exports = schema( {
  eventId: {
    type: 'integer',
    optional: false
  },
  agendaId: {
    type: 'integer',
    optional: false
  },
  featured: {
    type: 'boolean',
    default: 0
  },
  state: {
    type: 'integer',
    default: 0,
    min: 0,
    max: 2
  }
} );