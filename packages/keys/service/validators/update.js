"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' )
} );

module.exports = data => {

  const validate = schema( {
    label: {
      type: 'text',
      max: 255,
      default: null
    }
  } );

  return validate( data );

};
