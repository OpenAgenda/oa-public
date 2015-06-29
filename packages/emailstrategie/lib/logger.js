"use strict";

var logger = function( namespace ) {

  return function() {

    var args = Array.prototype.slice.call( arguments );

    if ( [ 'debug', 'info', 'error' ].indexOf( args[ 0 ] ) !== -1 ) {

      args.shift();

    }

    args[ 0 ] = namespace + ' - ' + args[ 0 ];
    
    console.log.apply( null, args );

  }

}

module.exports = function( namespace ) {

  return logger( namespace );

}

module.exports.setLogger = function( l ) {

  logger = l ? l : function() {};

}