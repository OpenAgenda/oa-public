"use strict";

const agendasCore = require( '../agendas' );

const get = require( './get' );

module.exports = async ( networkUid, agendaUid ) => {

  const network = await get( networkUid );

  if ( !network ) throw new Error( 'network not found' );

  const agenda = await agendasCore( agendaUid ).get();

  if ( !agenda ) throw new Error( 'agenda not found' );

  if ( agenda.networkUid ) throw new Error( 'agenda is already in a network' );

  return agendasCore( agenda ).update( { networkUid }, {
    protected: false,
    updateLegacy: true
  } );

}
