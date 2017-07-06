"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const queueLib = require( 'queue' );
const logger = require( 'basic-logger' );

const endpoints = {
  list: require( './service/list' ),
  get: require( './service/get' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  remove: require( './service/remove' ),
  validate: require( './iso/validate' )
}

module.exports = agendaId => _.mapValues( endpoints, e => e.bind( null, agendaId ) );

module.exports.states = require( './iso/states' );

module.exports.tasks = require( './tasks' );

module.exports.legacyTransfer = require( './service/legacyTransfer' );

module.exports.remove = require( './service/remove' ).byEventUid;

module.exports.init = c => {

  const config = _.extend( {
    queueNames: {
      interfaces: 'agendaEventInterfaces'
    }
  }, c );

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  config.queues = {
    interfaces: queueLib( config.queueNames.interfaces, { redis: config.redis } )
  };

  let client = knex( {
    client: 'mysql',
    connection: config.mysql
  } );

  Object.keys( endpoints ).forEach( e => endpoints[ e ].init( config, client, module.exports ) );

  Object.keys( module.exports.tasks ).forEach( k => module.exports.tasks[ k ].init( config, client, module.exports ) );

  module.exports.legacyTransfer.init( config, client );
}