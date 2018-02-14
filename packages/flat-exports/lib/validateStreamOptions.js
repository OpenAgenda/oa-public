"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  pass: require( '@openagenda/validators/pass' ),
  text: require( '@openagenda/validators/text' ),
  integer: require( '@openagenda/validators/integer' )
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