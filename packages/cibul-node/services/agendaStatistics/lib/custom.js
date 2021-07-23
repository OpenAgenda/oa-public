'use strict';

async function _run( services, { agendaUid } ) {
  const jobName = 'enqueueLegacyDatasetToCustom';

  const {
    agendas,
    custom
  } = services;

  const agenda = await agendas.get( { uid: agendaUid }, { private: null, internal: true } );

  if ( !agenda ) {
    return { message: 'Agenda not found', uid: agendaUid };
  }

  if ( !agenda.formSchemaId && !agenda.networkUid ) {
    return { message: 'Agenda is not linked with a form schema id', uid: agendaUid }
  }

  return custom[ jobName ]( agenda.id );

}
