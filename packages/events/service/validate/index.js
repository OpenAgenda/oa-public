"use strict";

const schema = require( 'validators/schema' ),

  _ = require( 'lodash' ),

  fields = require( './fields' );

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

module.exports = schema( fields );

module.exports.draft = schema( _.mapValues( fields, f => {

  // all is optional for draft validator
  if ( f.optional === false ) f.optional = true;

  return f;

} ) );