"use strict";

const agendaSettings = require( 'agenda-settings' );

const agendas = require( '@openagenda/agendas' ),

  logger = require( 'logger' );

module.exports.init = ( config, cb ) => {

  agendaSettings.init( {
    services: {
      agendas
    },
    mysql: config.db,
    schemas: config.schemas,
    logger
  }, cb );

}