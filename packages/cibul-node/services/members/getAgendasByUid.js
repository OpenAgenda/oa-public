"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = async agendaUids => {
  return agendas.list( { uid: agendaUids }, 0, 100, { private: null } )
    .then( ( { agendas } ) => agendas )
}
