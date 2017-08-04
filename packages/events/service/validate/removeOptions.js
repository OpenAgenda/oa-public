"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  boolean: require( 'validators/boolean' )
} );

module.exports = schema( {
  context: {
    userUid: {
      type: 'integer',
      optional: true,
      default: null
    }
  }
} );