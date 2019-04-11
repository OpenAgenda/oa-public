"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const agendaEvents = require( '@openagenda/agenda-events' );

const getAgenda = require( '../utils/getAgenda' );


module.exports = async ( agendaUid, eventUid, options ) => {

  const contextUserUid = _.get( options, 'context.userUid' );

  let result;

  const {
    formSchemaId
  } = await getAgenda( agendaUid );

  const removed = {
    event: false,
    agendaEvent: false,
    custom: false
  };

  const event = await events.get( { uid: eventUid }, {
    private: null,
    internal: true
  } );

  if ( !event ) {

    throw new VError( 'event of uid %s not found', eventUid );

  }

  if ( !event.draft ) {

    result = await agendaEvents( agendaUid ).remove( eventUid, {
      transferToLegacy: true,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false,
        deletion: true
      }
    } );

    if ( result.success ) {

      removed.agendaEvent = result.removed;

    }

  }

  if ( !event.draft && formSchemaId ) {

    result = await custom( formSchemaId ).remove( eventUid, {
      transferToLegacy: true,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false
      }
    } );

    if ( result.success ) {

      removed.custom = result.removed;

    }

  }

  const remaining = await agendaEvents.list.byEventUid( eventUid );

  if ( !remaining.length || (event.agendaUid === agendaUid) ) {

    result = await events.remove(
      { uid: eventUid },
      {
        agendaUid,
        userUid: contextUserUid,
        transferToLegacy: !event.draft
      }
    );

    if ( result.success ) {

      removed.event = result.event;

    }

  }

  return {
    success: true,
    removed
  };

}
