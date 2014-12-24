"use strict";

/**
 * sync events with services linked to their agenda
 * 
 * listens to coms service queue
 */


var log = require( '../lib/logger' )( 'jobs' ),

lib = require( '../lib/lib' ),

config = require( '../config' ),

/**
 * listen to service queue and sync any uncoming events linked to a service
 */

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

model,

running = false,

cli, // queue client

_onReady,

_onProcessed;


/**
 * exported function list
 */

exports.load = cmn.makeLoad( run );        // load task using offset and period
exports.run = run;                         // run task

/**
 * execute the task
 */

function run() {

  if ( !running ) {

    model = cmn.getCibulModel();

    running = true;

    log( 'running' );

  }

  if ( running ) _listen( );

}

function _listen() {

  log( 'listening' );

  coms.consume( config.jobsQueue, function( err, values ) {

    var servicePath = '../services/' + values.type,

    service;

    if ( values.type.indexOf( '/' ) == -1 ) {

      servicePath += '/' + values.type;

    }

    service = require( servicePath );

    ( typeof service !== 'function' ? service : service( model, config ) )[ values.action ]( values, function( err ) {

      if ( err ) {

        log( 'error', 'consumption error: %s', err );

      }

      if ( running ) _listen();

    });

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