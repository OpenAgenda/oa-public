"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  pass: require( 'validators/pass' ),
  text: require( 'validators/text' )
} );

module.exports = schema( {
  genUrl: {
    type: 'pass',
    default: null
  },
  lang: {
    type: 'text',
    default: 'fr'
  }
} );