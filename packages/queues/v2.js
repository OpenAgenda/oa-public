"use strict";

const STOP = 'STOPSIGNAL';

const promisifyRedis = require( './utils/promisifyRedis' );

module.exports = ( { redis, prefix } ) => name => Queue( redis, [ prefix + name ].join( '' ) );

function Queue( redis, queueName, methods = {} ) {

  const refs = methods;
  const ons = {};

  let taskRedisCli = null;

  const pRedis = promisifyRedis( redis );

  const queueMethods = Object.assign( queue.bind( null, pRedis, queueName ), {
    run: () => {
      taskRedisCli = run( redis, queueName, methods, ons );
    },
    register: methods => Object.assign( refs, methods )
  } );

  queueMethods.stop = async () => {
    if ( !taskRedisCli ) return;
    await pRedis.lpush( queueName, STOP );
    taskRedisCli = null;
  }

  queueMethods.on = ( name, fn ) => {
    ons[ name ] = fn;
    return queueMethods;
  };

  queueMethods.clear = () => pRedis.del( queueName );

  return queueMethods;
}

function queue( pRedis, queueName, method, ...args ) {

  return pRedis.rpush( queueName, JSON.stringify( { method, args } ) );

}

function run( redis, queueName, methods, ons = {} ) {

  const pRedis = promisifyRedis( redis.duplicate() );

  ( async () => {

    let blPopResult;

    while ( blPopResult = await pRedis.blpop( queueName, 0 ) ) {

      if ( blPopResult[ 1 ] === STOP ) return stop();

      try {
        const {
          method: methodName,
          args
        } = JSON.parse( blPopResult[ 1 ] );

        if ( !methods[ methodName ] ) {
          throw new Error( 'Unregistered method: ' + methodName );
        }

        await methods[ methodName ].apply( null, args );
      } catch ( e ) {
        if ( ons[ 'error' ] ) ons[ 'error' ]( e );
      }

    }

  } )();

  async function stop() {

    await pRedis.quit();

    ons[ 'finish' ] ? ons[ 'finish' ]() : null;

  }

  return pRedis;

}
