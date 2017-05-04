"use strict";

const adminAgendas = require( 'admin-agendas' );

const logger = require( 'logger' ),

  agendaStakeholders = require( 'agenda-stakeholders' ),

  agendas = require( 'agendas' );

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