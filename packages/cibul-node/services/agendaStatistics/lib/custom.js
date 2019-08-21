"use strict";

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );

const { promisify } = require( 'util' );

const agendaGet = promisify( agendas.get );

module.exports = _run.bind( null, 'enqueueLegacyDatasetToCustom' );

async function _run( jobName, { agendaUid } ) {

  const agenda = await agendaGet( { uid: agendaUid }, { private: null, internal: true } );

  if ( !agenda ) {
    return { message: 'Agenda not found', uid: agendaUid };
  }

  if ( !agenda.formSchemaId && !agenda.networkUid ) {
    return { message: 'Agenda is not linked with a form schema id', uid: agendaUid }
  }

  return custom[ jobName ]( agenda.id );

}
