"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' ),
} );

module.exports = schema( {
  protected: {
    type: 'boolean',
    default: true
  }
} );