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

const eventSchema = schema( fields );

module.exports = _clean.bind( null, eventSchema );

module.exports.draft = _clean.bind( null, schema( _.mapValues( fields, f => {

  // all is optional for draft validator
  if ( f.optional === false ) f.optional = true;

  return f;

} ) ) );

module.exports.default = eventSchema.default;


function _clean( validate, data ) {

  let clean = validate( data );

  clean.timings = _sortTimings( clean.timings );

  return clean;

}

function _sortTimings( timings ) {

  return timings.sort( ( t1, t2 ) => {

    return t1.begin > t2.begin ? 1 : -1;

  } );

}