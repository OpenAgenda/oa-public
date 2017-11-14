"use strict";

let aer = require( '@openagenda/agenda-event-references' ),

coms = require( '../../lib/coms' ),

config = require( '../../config' );

module.exports = function( agendaId, eventId ) {

  aer( agendaId ).clearReferences( eventId, ( err, impactedEventIds ) => {

    impactedEventIds.forEach( eventId => {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: {
          id: eventId,
          agendaId: agendaId, 
          type: 'references.clear'
        }
      } );

    } );

  } );

}