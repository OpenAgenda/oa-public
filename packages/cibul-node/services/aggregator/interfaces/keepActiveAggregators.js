"use strict";

const agendaSvc = require( '@openagenda/agendas' );

const wn = require( 'when/node' );

module.exports = async agendaIds => {

  const agendas = ( await wn.call( agendaSvc.list, { id: agendaIds }, 0, 200, { private: null, includeFields: [ 'credentials' ] } ) )[ 0 ];

  return agendas.filter( a => a.credentials && a.credentials.aggregator );

}