"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const setCustom = require( '../utils/setCustom' );

const log = require( '@openagenda/logs' )( 'core/agendas/utils/doAdd' );

module.exports = async ( agendaUid, eventUid, clean, options = {} ) => {

  const { draft, formSchemaId, networkFormSchemaId } = _.assign( {
    formSchemaId: null,
    networkFormSchemaId: null,
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
  if ( formSchemaId && clean.custom ) {

    const result = await setCustom( formSchemaId, eventUid, clean.custom, {
      draft,
      agendaId: clean.agendaId
    } );

    if ( result.errors.length ) {

      log( 'error', 'could not set custom data', result.errors );

    }

    added.custom = result.custom;

  }


  if ( networkFormSchemaId && clean.networkCustom ) {

    const result = await setCustom( networkFormSchemaId, eventUid, clean.networkCustom, {
      draft,
      agendaId: clean.agendaId
    } );

    if ( result.errors.length ) {

      log( 'error', 'could not set network custom data', result.errors );

    }

    added.networkCustom = result.custom;

  }

  return {
    success: true,
    added
  }

}
