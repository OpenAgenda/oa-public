"use strict";

const agendas = require( '@openagenda/agendas' );
const { promisify } = require( 'util' );
const setAgenda = promisify( agendas.set );

const agendaSettings = require( './settings' );

module.exports = async ( data, options = {} ) => {

  const { success, agenda } = await setAgenda( data );

  if ( !success ) throw new Error( 'could not create agenda' );

  if ( options.updateLegacy ) {
    await agendaSettings( agenda.uid ).legacy.update( true );
  }

  return agenda;

}
