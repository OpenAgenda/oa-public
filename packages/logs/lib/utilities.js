"use strict";

var TYPES = [ 'debug', 'info', 'notice', 'warning', 'err', 'crit', 'alert', 'emerg.']

module.exports = {
  extend: extend,
  getLogLevel: getLogLevel, // info, debug, error and such. Extract that from given arguments
  compileMessage: compileMessage
}

function getLogLevel( type ) {

  if ( TYPES.indexOf( type ) == -1 ) return 'debug';

  return type;

}

function compileMessage() {

  var args = Array.prototype.slice.call( arguments );

  if ( args.length < 2 ) return args[ 0 ];

  var compiled = args.shift();

  if ( typeof compiled == 'object' ) {

    if ( compiled.message ) {

      compiled = compiled.message;

    } else {

      compiled = false;

    }

  }

  if ( compiled ) {

    args.forEach( function( arg ) {

      compiled = compiled.replace( '%s', arg );

    });

  }

  return compiled;

}


function extend() {

  for ( var i=1; i<arguments.length; i++ ) {

    for ( var key in arguments[i] ) {

      if ( arguments[i].hasOwnProperty( key ) ) {

        arguments[ 0 ][ key ] = arguments[ i ][ key ];

      }

    }

  }
        
  return arguments[ 0 ];

}