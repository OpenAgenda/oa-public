'use strict';

const wn = require( 'when/node' );
const search = require( '../../elasticsearch' );

module.exports = async agendaId => {

  if (!search?.agendas) {
    return null;
  }

  const { total: published } = await wn.call( search.agendas( { id: agendaId } ).search, { passed: 1 }, { offset: 0, limit: 0 } ); 

  const { total } = await wn.call( search.agendas( { id: agendaId } ).search, { passed: 1 }, { offset: 0, limit: 0, showAll: true } );

  return {
    total,
    published
  }

}

module.exports.resync = agendaId => {

  return wn.call( search.agendas( { id: agendaId } ).resync );

}