"use strict";

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/get' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, eventUid ) => {

  const {
    formSchemaId,
    id: agendaId
  } = await getAgenda( agendaUid );

  const event = await events.get( { uid: eventUid } );

  if ( formSchemaId ) {

    const customData = await custom( formSchemaId ).get( eventUid );

    if ( customData ) {

      _.assign( event, customData );

    }

  }

  return event;

}
