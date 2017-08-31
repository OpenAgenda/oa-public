"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' ),

} );

module.exports = schema( {
  protected: {
    type: 'boolean',
    default: true
  },
  context: {
    optional: true,
    default: null,
    fields: {
      userUid: {
        type: 'integer',
        default: null
      },
      agendaUid: {
        type: 'integer',
        default: null
      }
    }
  }
} );