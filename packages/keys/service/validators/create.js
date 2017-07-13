"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' )
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
