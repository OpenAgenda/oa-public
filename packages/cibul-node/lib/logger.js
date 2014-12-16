var globalNamespace = {},

config = require( '../config' ),

lib = require( './lib' ),

debug = require('debug');

module.exports = function( namespace ) {
 
  var logger = require( 'bunyan' ).createLogger({
    name : config.name,
    streams: [{
      level: "info",
      type: 'rotating-file',
      path: config.logPath,
      period: '1d',
      count: 3
    },
    {
      level: "error",
      type: 'rotating-file',
      path: config.logPathError,
      period: '1d',
      count: 3    
    }]
  }),

  debugLog;

  if ( config.env == 'dev' ) {

    debug.enable( '*' );

    debugLog = debug( namespace );

  }

  if ( namespace ) {

    logger = logger.child( lib.extend( {}, globalNamespace, { namespace: namespace } ) );

  }

  var log = function( type ) {

    var types = [ 'info', 'debug', 'error' ],

    args = Array.prototype.slice.call( arguments );

    if ( types.indexOf( type ) === -1 ) {

      type = 'debug';

    } else {

      args.shift();

    }

    if ( args.length == 0 ) {

      logger[type]();

    } else if ( args.length == 1) {

      logger[type]( args[0] );

    } else if ( args.length == 2 ) {

      logger[type]( args[0], args[1] );

    } else {

      logger[type]( args[0], args[1], args[2] );

    }

    if ( debugLog ) {

      debugLog.apply( null, args );

    }

  },

  load = function( values ) {

    logger = logger.child( lib.extend( {}, globalNamespace, values ) );

  },

  globalLoad = function( values ) {

    logger = logger.child( lib.extend( globalNamespace, values ) );

  };


  return lib.extend( log, {
    
    load: load,
    globalLoad: globalLoad
  
  });


};