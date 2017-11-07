"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  number: require( '@openagenda/validators/number' ),
  date: require( '@openagenda/validators/date' ),
  slug: require( 'slugs/lib/iso/validator' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  list: require( '@openagenda/validators/list' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' )
} );

module.exports = schema( require( './frontFields' ) );