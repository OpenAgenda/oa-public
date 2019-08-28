"use strict";

const _ = require( 'lodash' );
const validate = require( '../validate' );

module.exports = ( { target, log } ) => v => {

  let validateFunc = v[ target ].draft ? validate.draft : validate;

  try {

    v.clean = validateFunc( v[ target ] );

  } catch( e ) {

    if ( !_.isArray( e ) ) throw e;

    log( 'validation failed with %s errors', e.length );

    v.errors = v.errors.concat( e );

  }

  return v;

}
