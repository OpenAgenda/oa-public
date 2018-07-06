"use strict";

const assign = require( 'lodash/assign' );
const omit = require( 'lodash/omit' );
const get = require( 'lodash/get' );

const schema = require( '@openagenda/validators/schema' );

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
  email: require( '@openagenda/validators/email' )
} );

const frontFields = require( './frontFields' );

const validate = schema( frontFields );

const sluglessValidate = schema( omit( frontFields, [ 'slug' ] ) );

module.exports = ( data, options = {} ) => {

  const params = assign( {
    optionalSlug: false
  }, options );

  if ( params.optionalSlug && !get( data, 'slug' ) ) {

    return sluglessValidate( data );

  }

  return validate( data );

}