"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
} );

module.exports = schema( {
  total: {
    type: 'boolean',
    default: false
  },
  internal: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  useDetaultImage: {
    type: 'boolean',
    default: false
  },
  html: {
    type: 'boolean',
    default: false
  }
} );