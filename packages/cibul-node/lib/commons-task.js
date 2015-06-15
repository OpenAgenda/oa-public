exports.makeLoad = makeLoad;
exports.getCibulModel = getCibulModel;       // get model instance

var lib = require( './lib' ),

config = require( '../config' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath, useCache: config.db.cache } ),

router = require( './router' ),

log = require( './logger' )( 'commons-task' );


/**
 * prepare task for periodic and offsetted runs
 */

function makeLoad( run ) {

  var params = {
    period: false,  // periodicity of the task
    bootOffset: 0   // offset time at which task will do its first run
  }

  return function( options ) {

    lib.extend( params, options );

    if ( params.period == 'daily' ) {

      params.period = 60000*60*24;

      params.bootOffset = _setBootOffset( params.time );

    }

    setTimeout( function() {

      run();

      if ( params.period !== false ) setInterval( run, params.period );

    }, params.bootOffset );

  }

}

function _setBootOffset( time ) {

  var now = new Date(),

  timeParts = time.split( ':' ),

  bootTime = new Date();

  bootTime.setHours( timeParts[ 0 ] );

  bootTime.setMinutes( timeParts[ 1 ] );

  if ( bootTime < now ) {

    bootTime.setHours( bootTime.getHours() + 24 );

  }

  return bootTime.getTime() - now.getTime();

}


/**
 * get a model instance
 */

function getCibulModel() {

  return model;

}