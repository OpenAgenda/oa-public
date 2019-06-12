"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' ),
  choice: require( '@openagenda/validators/choice' )
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
  private: {
    type: 'choice',
    default: false,
    options: [ true, false, null ],
    unique: true
  },
  useDetaultImage: {
    type: 'boolean',
    default: false
  },
  html: {
    type: 'boolean',
    default: false
  },
  fetched: {
    type: 'choice',
    options: [ 'uid' ],
    default: null
  }
} );
