"use strict";

const _ = require( 'lodash' );

/**
 * clean function before indexing.
 * assuming data input is clean already, this here ensures that no superfluous
 * fields are indexed
 */

module.exports = event => {

  if ( !event ) {

    throw new Error( 'data is unavailable for indexing' );

  }

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

  if ( event.custom ) {

    clean.custom = event.custom;

  }

  return clean;

}