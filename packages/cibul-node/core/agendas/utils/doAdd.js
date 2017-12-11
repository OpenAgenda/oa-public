"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const custom = require( '@openagenda/custom' );

module.exports = async ( agendaUid, eventUid, formSchemaId, clean ) => {

  const added = {
    agendaEvent: null,
    custom: null
  }

  // reference event on agenda
  let result = await agendaEvents( agendaUid ).create( eventUid, clean.agendaEvent, { transferToLegacy: true } );

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