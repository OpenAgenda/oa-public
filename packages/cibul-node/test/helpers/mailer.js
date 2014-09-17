process.env.NODE_ENV = 'testing';

var config = require('../../../config'),

redis = require('redis');

redisCli = redis.createClient(config.redis.port, config.redis.host);

exports.clearQueue = function( cb ) {

  redisCli.del( 'queues:mailer', function( err ) {

    if ( err ) return cb( err );

    cb();

  } );

}