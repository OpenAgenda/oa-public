"use strict";

/**
 * process a value against a list of validators
 * and return first validator that succeeds
 * or throw if all fails
 */

module.exports = function( value, validators ) {

  console.log( 'fdfsd');

  var errors = [], successful;

  validators.forEach( function( v ) {

    if ( successful ) return;

    try {

      v( value );

      successful = v;

    } catch( e ) {

      errors = errors.concat( e );

    }

  } );

  if ( !successful ) throw errors;

  return successful;

}