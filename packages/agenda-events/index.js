"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const queueLib = require( '@openagenda/queue' );
const logger = require( '@openagenda/logs' );

const endpoints = {
  list: require( './service/list' ),
  listByLastId: require( './service/list' ).byLastId,
  get: require( './service/get' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  set: require( './service/set' ),
  remove: require( './service/remove' ),
  validate: require( './iso/validate' )
}

const stats = require( './service/stats' );

module.exports = agendaUid => {

  return _.assign( _.mapValues( endpoints, e => e.bind( null, agendaUid ) ), {
    stats: _.mapValues( stats, ( e, k ) => k !== 'init' ? e.bind( null, agendaUid ) : e )
  } );

}

module.exports.states = require( './iso/states' );

module.exports.tasks = require( './tasks' );

module.exports.legacyTransfer = require( './service/legacyTransfer' );

module.exports.remove = require( './service/remove' ).byEventUid;

module.exports.list = require( './service/list' );

module.exports.validate = endpoints.validate.validateData;

module.exports.init = c => {

  const config = _.extend( {
    queueNames: {
      interfaces: 'agendaEventInterfaces'
    }
  }, c );

  if ( c.logger ) {

    logger.setModuleConfig( c.logger );

  }

  config.queues = {
    interfaces: queueLib( config.queueNames.interfaces, { redis: config.redis } )
  };

  const client = config.knex || knex( {
    client: 'mysql',
    connection: config.mysql
  } );

  Object.keys( endpoints ).forEach( e => endpoints[ e ].init ? endpoints[ e ].init( config, client, module.exports ) : null );

  stats.init( config, client );

  Object.keys( module.exports.tasks ).forEach( k => module.exports.tasks[ k ].init( config, client, module.exports ) );

  module.exports.legacyTransfer.init( config, client, endpoints );
}
