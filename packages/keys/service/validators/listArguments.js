"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  choice: require( 'validators/choice' ),
  text: require( 'validators/text' ),
  number: require( 'validators/number' ),
  pass: require( 'validators/pass' )
} );

module.exports = args => {

  const validate = schema( {
    query: {
      type: 'pass'
    },
    offset: {
      type: 'number',
      default: 0
    },
    limit: {
      type: 'number',
      default: 20
    },
    options: {
      type: 'pass'
    }
  } );

  return validate( args );

};
