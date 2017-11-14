"use strict";

const adminAgendas = require( '@openagenda/admin-agendas' );

const logger = require( '@openagenda/logger' ),

  agendaStakeholders = require( '@openagenda/agenda-stakeholders' ),

  agendas = require( '@openagenda/agendas' );

module.exports.init = ( config, cb ) => {

  adminAgendas.init( {
    services: {
      agendas,
      agendaStakeholders
    },
    mysql: config.db,
    schemas: config.schemas,
    logger
  }, cb );

}