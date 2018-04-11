"use strict";

const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const custom = require( '@openagenda/custom' );

module.exports = async ( agendaUid, eventUid, formSchemaId, clean ) => {

  const added = {
    agendaEvent: null,
    custom: null
  }

  // reference event on agenda
  let result;

  try {
    
    result = await agendaEvents( agendaUid ).create( eventUid, clean.agendaEvent, {
      transferToLegacy: true, // directive to replicate to legacy data structure
      context: {
        legacy: false // indication that context of operation is not legacy
      }
    });

  } catch ( e ) {

    throw new VError( e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agendaUid, eventUid );

  }


  added.agendaEvent = result.created;

  // create custom data
  if ( clean.custom ) {

    const added = await custom( formSchemaId ).create( eventUid, clean.custom, { transferToLegacy: true } );

    if ( result.success ) {

      added.custom = result.custom;

    }

  }

  return {
    success: true,
    added
  }

}