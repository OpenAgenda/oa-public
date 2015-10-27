"use strict";

var utils = require( 'utils' );


/**
 * prepare task for periodic and offsetted runs
 */

module.exports = function( run, options ) {

  var params = utils.extend( {
    period: false,  // periodicity of the task
    bootOffset: 0   // offset time at which task will do its first run
  }, options ? options : {} );

  if ( params.period == 'daily' ) {

    params.period = 60000*60*24;

    params.bootOffset = _setBootOffset( params.time );

  }

  setTimeout( function() {

    run();

    if ( params.period !== false ) {

      setInterval( run, params.period );

    }

  }, params.bootOffset );

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