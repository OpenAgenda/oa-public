"use strict";

const w = require( 'when' );

module.exports = ( interfaces, v ) => {

  if ( !v.query.agendaId ) {

    return v;

  }

  let d = w.defer();

  interfaces.getExistingCredentials( v.query.agendaId, ( err, existingCredentials ) => {

    if ( err ) return d.reject( err );

    // filter out credentials that are not in existing credentials
    v.query.credentials = v.query.credentials && v.query.credentials.length ? v.query.credentials.filter( c => existingCredentials.indexOf( c ) !== -1 ) : existingCredentials;

    d.resolve( v );

  } );

  return d.promise;

}