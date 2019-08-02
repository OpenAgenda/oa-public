"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = schema( {
  context: {
    user: { // user triggering the remove
      type: 'pass',
      default: null
    }
  }
} );
