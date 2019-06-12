"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = ( agendaId, cb ) => agendas.get(
  agendaId,
  ( err, agenda ) => cb( err, agenda ? agenda.settings : {} )
);
