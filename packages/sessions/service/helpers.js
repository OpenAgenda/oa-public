"use strict";

const _ = require( 'lodash' );
const cookieValidate = require( '../iso/cookie.validate' );
const logger = require( 'basic-logger' );
const config = require( './config' );
const redis = require( 'redis' );

let log = console.log;

module.exports = {
  cleanSession,
  redisCommand,
  interfaces,
  init,
  callbackify
}

function callbackify( p, cb ) {

  p.then( cb.bind( null, null ), cb ).catch( () => {} );

}

function interfaces( name, args ) {

  return new Promise( ( rs, rj ) => {

    config.interfaces[ name ].apply( null, ( _.isArray( args ) ? args : [ args ] ).concat( ( err, result ) => {  

      if ( err ) return rj( err );

      rs( result );

    } ) );

  } );

}

function redisCommand( command, args ) {

  const cli = redis.createClient( config.redis.port, config.redis.host );

  return new Promise( ( rs, rj ) => {

    cli[ command ].apply( cli, ( _.isArray( args ) ? args : [ args ] ).concat( ( err, result ) => {

      cli.quit();

      if ( err ) return rj( err );

      rs( result );

    } ) );

  } );

}

function cleanSession( session = {}, data = {} ) {

  let filtered = _.pick( session, Object.keys( session ) ),

    clean = {};

  try {

    clean = cookieValidate( _.extend( filtered, data ) );

  } catch( e ) { log( 'error', e ); }

  Object.keys( clean ).forEach( k => session[ k ] = clean[ k ] );

  return session;

}

function init() {

  log = logger( 'helpers' );

}