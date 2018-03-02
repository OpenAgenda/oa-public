"use strict";

const validate = require( '../validate' );

module.exports = ( { target, log } ) => v => {

  let validateFunc = v[ target ].draft ? validate.draft : validate;

  try {

    v.clean = validateFunc( v[ target ] );

  } catch( e ) {

    log( 'validation failed with %s errors', e.length );

    v.errors = v.errors.concat( e );

  }

  return v;

}