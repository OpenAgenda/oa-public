"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' ),
  slug: require( '../slugs/validator' )
} );

module.exports = schema( require( './publicFields' ) );