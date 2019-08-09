"use strict";

const { promisify } = require( 'util' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const logs = require( '@openagenda/logs' );

const interfaces = {
    onMessage: ( ...args ) => log( 'error', 'onMessage', args ),
    onCreate: require( './onCreate' ),
    onUpdate: require( './onUpdate' ),
    onRemove: require( './onRemove' ),
    onTransferEvent: require( './onTransferEvent' ),
    beforeTransferEvent: require( './beforeTransferEvent' ),
    getUser: require( './getUser' ),
    getExistingCredentials: require( './getExistingCredentials' ),
    getEventCount: require( './getEventCount' )
  }

module.exports.init = async config => {

  // set interface log functions
  Object.keys( interfaces ).forEach( k => interfaces[ k ].setLog && interfaces[ k ].setLog( logs( 'agendaStakeholders/interfaces/' + k ) ) );

  require( './lib/sendStakeholderInvitation' ).setLog( logs( 'agendaStakeholders/sendStakeholderInvitation' ) );

  await promisify( agendaStakeholders.init )( {
    queue: {
      names: {
        bulk: config.queues.stakeholderCreate,
        message: config.queues.stakeholderMessage
      },
      redis: config.redis,
      threshold: 20
    },
    schemas: config.schemas,
    mysql: config.db,
    logger: config.getLogConfig( 'svc', 'agendaStakeholders' ),
    interfaces
  } );

}
