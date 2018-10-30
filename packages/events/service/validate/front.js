"use strict";

const assign = require( 'lodash/assign' );
const omit = require( 'lodash/omit' );
const get = require( 'lodash/get' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  integer: require( '@openagenda/validators/integer' ),
  date: require( '@openagenda/validators/date' ),
  slug: require( '@openagenda/slugs/lib/iso/validator' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  list: require( '@openagenda/validators/list' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' ),
  pass: require( '@openagenda/validators/pass' )
} );

const frontFields = require( './frontFields' );

module.exports = ( data, options = {} ) => {

  const params = assign( {
    optionalSlug: false,
    legacy: false
  }, options );

  let fields = assign( {}, frontFields );

  if ( params.optionalSlug && !get( data, 'slug' ) ) {

    fields = omit( fields, [ 'slug' ] );

  }

  if ( params.legacy ) {

    fields.uid = {
      type: 'integer',
      optional: false
    }

  }

  return schema( fields )( data );

}
