"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  choice: require( '@openagenda/validators/choice' ),
  text: require( '@openagenda/validators/text' ),
  number: require( '@openagenda/validators/number' ),
  pass: require( '@openagenda/validators/pass' )
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
