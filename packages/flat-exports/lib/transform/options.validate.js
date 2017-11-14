"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = schema( {
  languages: {
    type: 'text',
    max: 2,
    min: 2,
    list: true
  },
  lang: {
    type: 'text',
    min: 2,
    max: 2,
    default: 'en'
  },
  labels: {
    type: 'pass'
  }
} );