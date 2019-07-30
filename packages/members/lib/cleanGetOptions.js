"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  boolean: require( '@openagenda/validators/boolean' )
} );

module.exports = schema( {
  legacy: {
    type: 'boolean',
    default: false
  }
} );
