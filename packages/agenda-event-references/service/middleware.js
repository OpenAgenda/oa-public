"use strict";

const utils = require( 'utils' );

let config; // defined at init

module.exports = {
  events,
  init
}

/**
 * forward event search to interfaced service
 */
function events( req, res, next ) {

  if ( !req.agendaId ) {

    return next( 'no agenda was specified' );

  }

  if ( !Object.keys( req.query ).length ) {

    req.events = [];

    next();

  }

  config.interfaces.events( req.agendaId, req.query, ( err, events ) => {

    if ( err ) return next( err );

    req.events = events;

    next();

  } );

}


function init( c ) {

  config = c;

}