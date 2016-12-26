"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  choice: require( 'validators/choice' ),
  boolean: require( 'validators/boolean' ),
  integer: require( 'validators/integer' )
} );

module.exports = schema( {
  search: {
    type: 'text',
    optional: true,
    max: 255
  },
  invited: {
    type: 'boolean',
    optional: true
  },
  credentials: {
    type: 'choice',
    optional: true,
    options: require( '../credentialTypes' ).map( c => c.value )
  },
  userId: {
    type: 'integer',
    optional: true
  },
  agendaId: {
    type: 'integer',
    optional: true
  }
} )