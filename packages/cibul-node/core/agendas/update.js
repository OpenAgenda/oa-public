"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendas = require( '@openagenda/agendas' );

const setAgenda = promisify( agendas.set );
const agendaSettings = require( './settings' );

module.exports = async ( agendaOrUid, data, options = {} ) => {

  const agendaUid = _.isObject( agendaOrUid ) ? agendaOrUid.uid : agendaOrUid;

  const { success, agenda } = await setAgenda( { uid: agendaUid }, data, options );

  if ( !success ) throw new Error( 'could not update agenda' );

  if ( options.updateLegacy ) {
    await agendaSettings( agenda ).legacy.update( true );
  }

  return agenda;

}
