"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const custom = require( '@openagenda/custom' );

const log = require( '@openagenda/logs' )( 'core/agendas/utils/doAdd' );

module.exports = async ( agendaUid, eventUid, options, clean ) => {

  const { draft, formSchemaId } = _.assign( {
    formSchemaId: null,
    draft: false
  }, _.isObject( options ) ? options : { formSchemaId: options } );

  const added = {
    agendaEvent: null,
    custom: null
  }

  if ( !draft ) {

    try {
    
      const { created } = await agendaEvents( agendaUid ).create( eventUid, clean.agendaEvent, {
        transferToLegacy: true, // directive to replicate to legacy data structure
        context: {
          legacy: false // indication that context of operation is not legacy
        }
      } );

      added.agendaEvent = created;

    } catch ( e ) {

      throw new VError( e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agendaUid, eventUid );

    }

  }

  // create custom data
  if ( clean.custom ) {

    try {

      const { success, custom: created } = await custom( formSchemaId ).create( eventUid, clean.custom, {
        transferToLegacy: !draft,
        agendaId: clean.agendaId,
        draft
      } );

      if ( success ) {

        added.custom = created;

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
