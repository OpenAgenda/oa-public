"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
} );

module.exports = schema( {
  detailed: {
    type: 'boolean',
    default: false
  },
  total: {
    type: 'boolean',
    default : false
  },
  legacy: {
    type: 'boolean',
    default: false
  }
} );
