"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' )
} );


module.exports = schema( {
  detailed: {
    type: 'boolean',
    default: false
  },
  extensions: {
    type: 'text',
    list: true
  }
} );