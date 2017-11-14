"use strict";

const adminAgendas = require( 'admin-agendas' );

const logger = require( 'logger' ),

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