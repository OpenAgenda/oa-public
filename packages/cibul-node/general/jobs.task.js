"use strict";

/**
 * sync events with services linked to their agenda
 * 
 * listens to coms service queue
 */

const log = require( '@openagenda/logs' )( 'jobs' );

var lib = require( '../lib/lib' ),

config = require( '../config' ),

/**
 * listen to service queue and sync any incoming events linked to a service
 */

coms = require( '../lib/coms' ),

model = require( '../services/model' ),

running = false,

cli, // queue client

_onReady,

_onProcessed;


module.exports = run;



function run() {

  if ( !running ) {

    running = true;

    log( 'running' );

  }

  if ( running ) _listen( );

}

function _listen() {

  log( 'info', 'listening' );

  coms.consume( config.jobsQueue, function( err, values ) {

    log( 'info', 'received %s', JSON.stringify( values ) );

    var servicePath = '../services/' + values.type,

    service;

    if ( values.type.indexOf( '/' ) == -1 ) {

      servicePath += '/' + values.type;

    }

    try {

      service = require( servicePath.replace( '/index', '' ) );

    } catch( e ) {

      log( 'error', 'trouble processing service %s', servicePath );

    }

    if ( service ) {

      log( 'info', 'sending values %s to service %s', JSON.stringify( values ), servicePath );

      ( typeof service !== 'function' ? service : service( model, config ) )[ values.action ]( values, function( err ) {

        if ( err ) {

          log( 'error', 'consumption error: %s', err );

        }

        if ( running ) _listen();

      });
    
    } else {

      if ( running ) _listen();
      
    }

  } );

}


function shutdown( ) {

  log( 'shutting down' );

  if ( cli ) coms.end( cli );

  running = false;

}

function setOnReady( cb ) {

  _onReady = cb;

}

function setOnProcessed( cb ) {

  _onProcessed = cb;

}
