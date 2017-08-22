"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' )
} );

module.exports = schema( {
  field: {
    type: 'text',
    optional: false
  }
} );