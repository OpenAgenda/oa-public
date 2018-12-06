"use strict";

const { promisify } = require( 'util' );
const VError = require( 'verror' );

const agendas = require( '@openagenda/agendas' );

const getAgenda = promisify( agendas.get );

module.exports = async agendaUid => {

  const agenda = await getAgenda( { uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  } );

  if ( !agenda ) {

    throw new VError( 'agenda of uid %d was not found', agendaUid );

  }

  return agenda;

}
