"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' )
} );

module.exports = schema( {
  identifier: {
    type: 'integer',
    list: { default: null }
  }
} );