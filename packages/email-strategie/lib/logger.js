"use strict";

var logger = function( namespace ) {

  log.load = function() {};
 
  return log;

  function log() {

    var args = Array.prototype.slice.call( arguments );

    if ( [ 'debug', 'info', 'error' ].indexOf( args[ 0 ] ) !== -1 ) {

      args.shift();

    }

    args[ 0 ] = namespace + ' - ' + args[ 0 ];
    
    console.log.apply( null, args );

  }

}

module.exports = function( namespace ) {

  var log = logger( 'emailStrategie' );

  log.load( { lib: namespace } );

  return log;

}

module.exports.setLogger = function( l ) {

  logger = l ? l : function() {};

}