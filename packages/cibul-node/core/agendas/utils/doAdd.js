"use strict";

const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const custom = require( '@openagenda/custom' );

const log = require( '@openagenda/logs' )( 'core/agendas/utils/doAdd' );

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
    } );

  } catch ( e ) {

    throw new VError( e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agendaUid, eventUid );

  }

  added.agendaEvent = result.created;

  // create custom data
  if ( clean.custom ) {

    try {

      const result = await custom( formSchemaId ).create( eventUid, clean.custom, {
        transferToLegacy: true
      } );

      if ( result.success ) {

        added.custom = result.custom;

      }

    } catch ( e ) {

      log( 'error', 'did not sync legacy on custom create %s.%s: %s', formSchemaId, eventUid, e );

    }

  }

  return {
    success: true,
    added
  }

}