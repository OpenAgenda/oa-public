"use strict";

process.env.DEBUG_FD=1; // log to stdout instead of stderr

var config,

u = require( './lib/utilities.js' ),

LE = require( 'le_node' ),

logger,

baseLogVars = {},

debugPrefix = '',

debug = require( 'debug' );

module.exports = function( namespace, preloaded ) {

  var logVars = {
    namespace: namespace
  },

  debugLog = debug( debugPrefix + namespace );

  log.load = load;

  if ( preloaded ) load( preloaded );

  return log;

  function log( level, message, args ) {

    var args = Array.prototype.slice.call( arguments ),

    level = u.getLogLevel.apply( null, args ),

    message,

    entry,

    obj = {};

    if ( args[ 0 ] == level ) args.shift();

    message = u.compileMessage.apply( null, args );

    if ( typeof args[ 0 ] == 'object' ) obj = args[ 0 ];

    entry = u.extend(
      { level: level }, baseLogVars, logVars, obj, 
      message ? { message: message } : {}
    );

    if ( logger && level !== 'debug' ) logger.log( entry );

    if ( _hasLogLevel( level ) ) {

      debugLog( message );

    }

    return config ? entry : null;

  }

  function load( values ) {

    u.extend( logVars, values );

  }
  
}

module.exports.enable = debug.enable;

module.exports.init = function( c ) {

  config = c;

  if ( c.token ) logger = new LE( { 
    token: c.token
  } );

  if ( c.base ) {

    baseLogVars = c.base;

  }

  if ( logger ) logger.on( 'error', function( error ) {

    console.log( 'logentries error: %s', error );

  });

  if ( c.debug ) {

    debugPrefix = c.debug.prefix ? c.debug.prefix : '';

    debug.enable( c.debug.enable );

  }

}

function _hasLogLevel( level ) {

  return u.TYPES.indexOf( level ) >= u.TYPES.indexOf( process.env.LOG_LEVEL );

}