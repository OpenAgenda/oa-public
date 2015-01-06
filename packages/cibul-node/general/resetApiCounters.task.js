"use strict";

var log = require( '../lib/logger' )( 'daily task' ),

async = require( 'async' ),

config = require( '../config' ),

cmn = require( '../lib/commons-task' ),

model = cmn.getCibulModel(),

redis = require( 'redis' ),

running = false,

offset = 0, limit = 40,

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

  offset = 0;

  cli = redis.createClient( config.redis.port, config.redis.host );

  async.whilst(
    
    function() { return running; },

    function( wcb ) {

      model.lib.query( 'select id from api_key_set limit ?, ?', [ offset, limit ], function( err, rows ) {

        if ( _handleIfErr( err, wcb ) ) return;

        offset += limit;

        async.eachSeries( rows, function( row, ecb ) {

          cli.hget( config.api.redis.prefix + row.id, config.api.redis.publishCount, function( err, count ) {

            if ( _handleIfErr( err, ecb ) ) return;

            log( 'info', { message: 'api counter' , keySetId: row.id , count: count });

            if ( !count ) {

              return ecb();

            }

            cli.hset( config.api.redis.prefix + row.id, config.api.redis.publishCount, 0, ecb );

          } );
          
        }, function( err ) {

          if ( _handleIfErr( err, wcb ) ) return;

          if ( rows.length < limit ) {

            running = false;

          }

          wcb();

        });

      } );

    },

    function( err ) {

      if ( _onComplete ) _onComplete();

    }
  );

}

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}

function _handleIfErr( err, cb ) {

  if ( err ) {

    running = false;

    log( 'error', err );

    if ( cb ) cb( err );

    return true;

  }

  return false;

}