"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );

module.exports = ( req, res, next ) => {
  agendaEvents( req.agenda.uid ).get( req.event.uid ).then( ae => {
    if ( !ae ) return next( { code: 404, error: 'agendaEventNotFound' } );
    req.agendaEvent = ae;
    next();
  } );
}
