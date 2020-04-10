"use strict";

let schema = require( '@openagenda/validators/schema' ),

utils = require( '@openagenda/utils' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  integer: require( '@openagenda/validators/integer' ),
  date: require( '@openagenda/validators/date' ),
  slug: require( '../slugs/validator' ),
  choice: require( '@openagenda/validators/choice' ),
  ip: require( '@openagenda/validators/ip' )
} );

module.exports = schema( utils.extend( {},
  require( './privateFields' ),
  require( './publicFields' )
) );
