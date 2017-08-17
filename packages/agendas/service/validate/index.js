"use strict";

let schema = require( 'validators/schema' ),

utils = require( 'utils' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  integer: require( 'validators/integer' ),
  date: require( 'validators/date' ),
  slug: require( '../slugs/validator' ),
  choice: require( 'validators/choice' ),
  ip: require( 'validators/ip' )
} );

module.exports = schema( utils.extend( {},
  require( './privateFields' ), 
  require( './publicFields' ) 
) );