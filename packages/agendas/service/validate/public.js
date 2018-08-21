"use strict";

// ES5
var schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  number: require( '@openagenda/validators/number' ),
  integer: require( '@openagenda/validators/integer' ),
  date: require( '@openagenda/validators/date' ),
  slug: require( '../slugs/validator' ),
  choice: require( '@openagenda/validators/choice' ),
  email: require( '@openagenda/validators/email' ),
  ip: require( '@openagenda/validators/ip' )
} );

module.exports = schema( require( './publicFields' ) );
