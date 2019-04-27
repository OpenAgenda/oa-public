"use strict";

const { promisify } = require( 'util' );

const agendasCore = require( '../agendas' );
const agendas = require( '@openagenda/agendas' );

const get = require( './get' );
const agendaSet = promisify( agendas.set );

module.exports = async ( networkUid, agendaUid ) => {

  const network = await get( networkUid );

  if ( !network ) throw new Error( 'network not found' );

  const agenda = await agendas.get( { uid: agendaUid } );

  if ( !agenda ) throw new Error( 'agenda not found' );

  if ( agenda.networkUid ) throw new Error( 'agenda is already in a network' );

  await agendaSet( { uid: agendaUid }, { networkUid }, { protected: false } );

  await agendasCore( agenda ).settings.legacy.update( true );

}
