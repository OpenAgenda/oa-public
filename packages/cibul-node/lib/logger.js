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

  if ( config.env !== 'prod' ) {

    debug.enable( '*' );

    debugLog = debug( namespace );

  }

  if ( namespace ) {

    logger = logger.child( lib.extend( {}, globalNamespace, { namespace: namespace } ) );

  }

  var log = function( type, val, val2, val3 ) {

    var types = [ 'info', 'debug', 'error' ]; 

    if ( types.indexOf( type ) === -1 ) {

      val3 = val2;
      val2 = val;
      val = type;
      type = 'debug';

    }

    if ( arguments.length == 1 ) {

      logger[type]( val );

    } else if ( arguments.length == 2) {

      logger[type]( val );

    } else if ( arguments.length == 3 ) {

      logger[type]( val, val2 );

    } else {

      logger[type]( val, val2, val3 );

    }

    if ( debugLog ) {

      if ( types.indexOf( type ) !== -1 ) {

        lib.extend( arguments, { '0': arguments[ '1' ], '1': arguments[ '2' ], '2': arguments[ '3' ] } );

      }

      debugLog.apply( null, Array.prototype.slice.call( arguments ) );

    }

  },

  load = function( values ) {

    console.log( values );

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