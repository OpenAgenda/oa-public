"use strict";

const _ = require( 'lodash' );
const redis = require( 'redis' );
const { promisify } = require( 'util' );
const VError = require( 'verror' );

const clients = {};

let config;

module.exports = _.extend( enqueue, {
  pop,
  waitAndPop,
  total,
  clear,
  init
} );


async function clear() {

  const client = await _getRedisClient();

  return client.p.del( _queueName() )

}


async function total( agendaUid ) {

  const client = await _getRedisClient();

  return client.p.llen( _queueName() );

}


function waitAndPop() {

  return _getRedisClient( 'task' ).then( client => {

    return new Promise( ( rs, rj ) => {

      console.log( 'blpop on %s', _queueName() );

      client.blpop( _queueName(), 0, ( err, result ) => {

        if ( err ) return rj( err );

        rs( JSON.parse( result[ 1 ] ) );

      } );

    }  );

  } );

}


async function enqueue( data ) {

  const client = await _getRedisClient();

  return client.p.rpush( _queueName(), JSON.stringify( data ) );

}


async function pop( options = {} ) {

  const { wait } = _.extend( {
    wait: false
  }, options );

  const client = await _getRedisClient();

  const popped = await client.p.lpop( _queueName() );

  return popped ? JSON.parse( popped ) : null;

}


async function init( c ) {

  config = c;

  try {

    await _getRedisClient();

  } catch( e ) {

    throw new VError( e, 'oa-docx init - Could not connect to redis' );

  }

}


async function _getQueueLength() {

  const client = await _getRedisClient();

  const result = await client.p.llen( _queueName() );

  return result === false ? 0 : result;

}


function _queueName() {

  //docx:queue
  return config.namespace + (config.separator || ':') + 'queue';

}


function _getRedisClient( name = 'default' ) {

  return new Promise( ( rs, rj ) => {

    let responded = false;

    function _respond( err ) {

      if ( responded ) return;

      responded = true;

      if ( err ) clients[ name ] = null;

      err ? rj( err ) : rs( clients[ name ] );

    }

    if ( clients[ name ] ) return _respond( null, clients[ name ] );

    if ( !config ) {

      return _respond( new Exception( 'redis config is missing' ) );

    }

    clients[ name ] = redis.createClient( config.redis.port, config.redis.host );

    _promisifyRedisClient( clients[ name ], [ 'get', 'set', 'llen', 'rpush', 'lpop', 'blpop', 'del' ] );

    clients[ name ].on('error', _respond );

    clients[ name ].on( 'ready', () => {

      _respond( null, clients[ name ] );

    } );

  } );

}

function _closeRedisClient( name = 'default' ) {

  clients[ name ] = null;

}

function _promisifyRedisClient( client, methods ) {

  client.p = methods.reduce( ( promised, method ) => {

    promised[ method ] = promisify( client[ method ].bind( client ) );

    return promised;

  }, {} );

}
