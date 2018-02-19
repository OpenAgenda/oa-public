"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' )
} );

module.exports = schema( {
  field: {
    type: 'text',
    optional: false
  }
} );