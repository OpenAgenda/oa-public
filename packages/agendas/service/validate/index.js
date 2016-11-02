"use strict";

let schema = require( 'validators/schema' ),

utils = require( 'utils' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' ),
  slug: require( '../slugs/validator' )
} );

module.exports = schema( utils.extend( {},
  require( './privateFields' ), 
  require( './publicFields' ) 
) );