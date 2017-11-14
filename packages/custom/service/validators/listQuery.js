"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' )
} );

module.exports = schema( {
  identifier: {
    type: 'integer',
    list: { default: null }
  }
} );