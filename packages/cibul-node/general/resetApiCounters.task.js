"use strict";

var log = require( '../lib/logger' )( 'daily task' ),

config = require( '../config' ),

cmn = require( '../lib/commons-task' ),

model = cmn.getCibulModel(),

redis = require( 'redis' ),

running = false,

_onStart,

_onComplete;


/**
 * exposed function list
 */

exports.load = cmn.makeLoad( run );
exports.run = run;

// for testing
exports.setOnStart = setOnStart;
exports.setOnComplete = setOnComplete;



function run() {

  var cli;

  if ( running ) {

    log( 'info', 'already running' );

    return;

  }

  log( 'running' );

  if ( _onStart ) _onStart();

  running = true;

  cli = redis.createClient( config.redis.port, config.redis.host );

  model.lib.eachQuery( 'select id from api_key_set', function( row, qcb ) {

    cli.hget( config.api.redis.prefix + row.id, config.api.redis.publishCount, function( err, count ) {

      if ( err ) return qcb( err );

      log( 'info', { message: 'api counter' , keySetId: row.id , count: count });

      if ( !count ) {

        return qcb();

      }

      cli.hset( config.api.redis.prefix + row.id, config.api.redis.publishCount, 0, qcb );

    } );

  }, function( err ) {

    running = false;

    if ( err ) {

      log( 'error', err );

    }

    if ( _onComplete ) _onComplete();

  } );

}

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}