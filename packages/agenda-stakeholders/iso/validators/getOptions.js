"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' )
} );

module.exports = schema( {
  detailed: {
    type: 'boolean',
    default: false
  }
} );