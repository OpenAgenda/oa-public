"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  pass: require( 'validators/pass' )
} );


module.exports = schema( {
  detailed: {
    type: 'boolean',
    default: false
  },
  extensions: {
    type: 'text',
    list: true
  },
  merge: {
    type: 'pass',
    default: null
  }
} );