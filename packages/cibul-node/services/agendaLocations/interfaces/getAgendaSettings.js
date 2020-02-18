"use strict";

module.exports = (services, agendaId, cb) => services.agendas.get(
  agendaId,
  ( err, agenda ) => cb( err, agenda ? agenda.settings : {} )
);
