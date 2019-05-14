"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' )
} );

module.exports = schema( {
  from: {
    type: 'integer',
    default: null
  },
  limit: {
    type: 'integer',
    default: 20
  }
} );
