"use strict";
const { promisify } = require( 'util' );
const agendaSettings = require( '@openagenda/agenda-settings' );
const agendas = require( '@openagenda/agendas' );
const logger = require( '@openagenda/logger' );

module.exports.init = async config => {

  await promisify( agendaSettings.init )( {
    services: {
      agendas
    },
    mysql: config.db,
    schemas: config.schemas,
    logger
  } );

}
