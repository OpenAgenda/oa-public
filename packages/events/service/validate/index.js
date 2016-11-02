"use strict";

const schema = require( 'validators/schema' ),

utils = require( 'utils' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' ),
  slug: require( 'slugs/lib/iso/validator' ),
  multilingual: require( 'validators/multilingual' ),
  list: require( 'validators/list' ),
  phone: require( 'validators/phone' ),
  email: require( 'validators/email' )
} );

module.exports = schema( utils.extend( {},
  require( './serverFields' ), 
  require( './frontFields' )
) );