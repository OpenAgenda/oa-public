"use strict";

const mailer = require( 'mailer' ),

  logger = require( 'logger' );

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
}