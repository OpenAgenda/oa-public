"use strict";

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );

const { promisify } = require( 'util' );

const agendaGet = promisify( agendas.get );

module.exports = async ( { agendaUid } ) => {

  const agenda = await agendaGet( { uid: agendaUid }, { private: null, internal: true } );

  if ( !agenda ) {

    return { message: 'Agenda not found', uid: agendaUid };

  }

  if ( !agenda.formSchemaId ) {

    return { message: 'Agenda is not linked with a form schema id', uid: agendaUid }

  }

  return custom( agenda.formSchemaId ).resync( agenda.id );

}