"use strict";

const { promisify } = require( 'util' );
const adminAgendas = require( '@openagenda/admin-agendas' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const agendas = require( '@openagenda/agendas' );
const credentials = require( '@openagenda/agendas/service/validate/privateFields' ).credentials;
const config = require( '../config' );

module.exports.init = async config => {

  await promisify( adminAgendas.init )( {
    services: {
      agendas,
      agendaStakeholders
    },
    interfaces: {
      getAgendaCredentialDetails: () => credentials
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: config.getLogConfig( 'svc', 'admin-agendas', false )
  } );

};
