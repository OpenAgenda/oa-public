"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const queueLib = require( '@openagenda/queue' );
const logger = require( '@openagenda/logs' );

const endpoints = {
  list: require('./service/list'),
  get: require( './service/get' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  set: require( './service/set' ),
  remove: require( './service/remove' ),
  validate: require( './iso/validate' )
}

const stats = require( './service/stats' );

module.exports = c => {
  const config = {
    queueNames: {
      interfaces: 'agendaEventInterfaces'
    },
    ...c
  };

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  config.queues = {
    interfaces: queueLib(config.queueNames.interfaces, { redis: config.redis })
  }

  const client = config.knex || knex({
    client: 'mysql',
    connection: config.mysql
  });

  const list = endpoints.list(config, client);
  const get = endpoints.get(config, client);

  return Object.assign(agendaUid => ({
    list: list.bind(null, agendaUid),
    get: get.bind(null, agendaUid),
    create: endpoints.create.bind(null, { config, client, get }, agendaUid),
    update: endpoints.update.bind(null, { config, client, get }, agendaUid),
    listByLastId: list.byLastId.bind(null, agendaUid)
  }), {
    list: {
      byEventUid: list.byEventUid,
      byUserUid: list.byUserUid
    },
    get: {
      byLegacyId: get.byLegacyId
    },
    remove: endpoints.remove.byEventUid.bind(null, {
      config,
      client,
      listByEventUid: list.byEventUid
    })
  });
}

/*module.exports = agendaUid => {

  return _.assign( _.mapValues( endpoints, e => e.bind( null, agendaUid ) ), {
    stats: _.mapValues( stats, ( e, k ) => k !== 'init' ? e.bind( null, agendaUid ) : e )
  } );

}*/

module.exports.states = require( './iso/states' );

module.exports.tasks = require( './tasks' );

module.exports.legacyTransfer = require( './service/legacyTransfer' );

module.exports.remove = require( './service/remove' ).byEventUid;

module.exports.list = require( './service/list' );

module.exports.validate = endpoints.validate.validateData;

module.exports.utils = {
  setSourcePaths: require('./utils/setSourcePaths').bind(null, endpoints),
}

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
