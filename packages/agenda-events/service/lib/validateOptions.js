"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),

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