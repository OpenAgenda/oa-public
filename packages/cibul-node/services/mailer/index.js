"use strict";

const mailer = require( '@openagenda/mailer' ),

  logger = require( '@openagenda/logger' ),

  queue = require( '@openagenda/queue' ),

  tasks = require( './tasks' ),

  _ = require( 'lodash' );

let q;

module.exports.init = config => {

  mailer.init( {
    queueName: 'mailer',
    host: config.redis.host,
    port: config.redis.port,
    log: logger( 'mailer' ),
    mailService: config.mailer.service,
    mailServiceConf: Object.assign( {
      mailDefault: config.mailer.mailDefault
    }, config.mailerServices[ config.mailer.service ] )
  } );

  q = queue( 'mailerService', { redis: config.redis } );

}

module.exports.queue = _.mapValues( tasks, ( v, k ) => data => {

  q( _.extend( { method: k }, data ) );

} );

module.exports.task = () => {

  require( '@openagenda/mailer' ).task();

  q.setConsumer( ( data, cb ) => {

    return tasks[ data.method ]( data, cb );

  } );

  q.launch();

}