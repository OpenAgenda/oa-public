"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  boolean: require( 'validators/boolean' )
} );

module.exports = schema( {
  total: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  showSlugs: {
    type: 'boolean',
    default: false
  }
} );