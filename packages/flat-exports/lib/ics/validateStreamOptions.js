"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  pass: require( 'validators/pass' ),
  text: require( 'validators/text' ),
  integer: require( 'validators/integer' )
} );

module.exports = schema( {
  genUrl: {
    type: 'pass',
    default: null
  },
  lang: {
    type: 'text',
    default: 'fr'
  },
  slug: {
    type: 'text',
    optional: false,
  },
  identifier: {
    type: 'integer',
    optional: false
  },
  type: {
    type: 'text',
    default: 'agenda'
  },
  title: {
    type: 'text',
    optional: false
  },
  description: {
    type: 'text'
  }
} );