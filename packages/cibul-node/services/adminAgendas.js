"use strict";

const { promisify } = require( 'util' );
const adminAgendas = require( '@openagenda/admin-agendas' );
const agendas = require( '@openagenda/agendas' );
const credentials = require( '@openagenda/agendas/service/validate/privateFields' ).credentials;

module.exports.init = async (config, services) => {

  await promisify( adminAgendas.init )( {
    services: {
      agendas,
      members: services.members
    },
    interfaces: {
      getAgendaCredentialDetails: () => credentials
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: config.getLogConfig( 'svc', 'admin-agendas', false )
  } );

};
