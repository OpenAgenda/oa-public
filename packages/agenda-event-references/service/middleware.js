"use strict";

const utils = require( '@openagenda/utils' );

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

    return next();

  }

  config.interfaces.events( req.agendaId, req.query, { showAll: !!req.access }, ( err, events ) => {

    if ( err ) return next( err );

    req.events = events;

    next();

  } );

}


function init( c ) {

  config = c;

}