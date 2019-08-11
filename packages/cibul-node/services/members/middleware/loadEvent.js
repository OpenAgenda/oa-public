"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );

module.exports = ( req, res, next ) => {
  events.get( { slug: req.params.eventSlug }, { private: null, internal: true } ).then( event => {
    if ( !event ) return next( 'Event not found' );
    agendaEvents( req.agenda.uid ).get( event.uid ).then( ae => {
      if ( !ae ) return next( 'Event is not associated with agenda' );
      req.event = event;
      next();
    } );
  } );
}
