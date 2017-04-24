"use strict";

const _ = require( 'lodash' );

/**
 * clean function before indexing.
 * assuming data input is clean already, this here ensures that no superfluous
 * fields are indexed
 */

// this could be cleaner, with a validator for the full indexed event-location
// that can and is extended with FormSchema fields.

module.exports = event => {

  let clean = _.extend( {}, event );

  if ( clean.location ) {

    clean.location = _.pick( clean.location, [
      'uid',
      'name',
      'address',
      'latitude',
      'longitude',
      'district',
      'city',
      'department',
      'region',
      'countryCode',
      'timezone'
    ] ); 

  }

  return clean;

}