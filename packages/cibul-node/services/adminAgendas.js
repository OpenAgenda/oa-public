"use strict";

const adminAgendas = require( '@openagenda/admin-agendas' );

const logger = require( '@openagenda/logger' ),

  agendaStakeholders = require( '@openagenda/agenda-stakeholders' ),

  agendas = require( '@openagenda/agendas' );

const credentials = require( '@openagenda/agendas/service/validate/privateFields' ).credentials;

module.exports.init = ( config, cb ) => {

  adminAgendas.init( {
    services: {
      agendas,
      agendaStakeholders
    },
    interfaces: {
      getAgendaCredentialDetails: () => credentials
    },
    mysql: config.db,
    schemas: config.schemas,
    logger
  }, cb );

}