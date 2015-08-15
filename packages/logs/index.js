"use strict";

var config,

u = require( './lib/utilities.js' ),

LE = require( 'le_node' ),

logger,

baseLogVars = {},

debug = require( 'debug' );

module.exports = function( namespace ) {

  var logVars = {
    namespace: namespace
  },

  debugLog = debug( namespace );

  log.load = load;

  return log;

  function log( level, message, args ) {

    if ( !config ) return null;

    var args = Array.prototype.slice.call( arguments ),

    level = u.getLogLevel.apply( null, args ),

    message,

    entry;

    if ( args[ 0 ] == level ) args.shift();

    message = u.compileMessage.apply( null, args );

    entry = u.extend( {
      level: level,
      message: message
    }, baseLogVars, logVars );

    logger.log( entry );

    debugLog( message );

    return entry;

  }

  function load( values ) {

    u.extend( logVars, values );

  }
  
}

module.exports.enable = debug.enable;

module.exports.init = function( c ) {

  config = c;

  logger = new LE( { 
    token: c.token
  } );

  if ( c.base ) {

    baseLogVars = c.base;

  }

  logger.on( 'error', function( error ) {

    console.log( 'logentries error: %s', error );

  });

  debug.enable( c.debugEnable );

}