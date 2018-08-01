"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

const fields = require( './fields' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  number: require( '@openagenda/validators/number' ),
  date: require( '@openagenda/validators/date' ),
  slug: require( '@openagenda/slugs/lib/iso/validator' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  list: require( '@openagenda/validators/list' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' ),
  integer: require( '@openagenda/validators/integer' )
} );

const eventSchema = schema( fields );

module.exports = _clean.bind( null, eventSchema );

module.exports.draft = _clean.bind( null, schema( _.mapValues( fields, f => {

  // all is optional for draft validator
  if ( f.optional === false ) f.optional = true;

  return f;

} ) ) );

module.exports.default = eventSchema.default;

module.exports.front = require( './front' );


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