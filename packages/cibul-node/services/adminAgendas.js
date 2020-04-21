"use strict";

const { promisify } = require( 'util' );
const adminAgendas = require( '@openagenda/admin-agendas' );

module.exports.init = async (config, services) => {
  const {
    agendas,
    members
  } = services;

  await promisify( adminAgendas.init )( {
    services: {
      agendas,
      members
    },
    interfaces: {
      getAgendaCredentialDetails: () => agendas.utils.credentials
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: config.getLogConfig( 'svc', 'admin-agendas', false )
  } );

};
