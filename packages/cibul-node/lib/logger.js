var globalNamespace = {},

config = require( '../config' ),

lib = require( './lib' ),

debug = require('debug'),

fs = require( 'fs' );

var writeStreams = {
  info: fs.createWriteStream( config.logPath ),
  error: fs.createWriteStream( config.logPathError )
};

module.exports = function( namespace ) {
 
  var logger = require( 'bunyan' ).createLogger({
    name : config.name,
    streams: [ {
      level: "info",
      type: "stream",
      stream: writeStreams.info
    }, {
      level: "error",
      type: 'stream',
      stream: writeStreams.error
    } ]
  }),

  debugLog;

  if ( config.logNameSpaces ) {

    debug.enable( config.logNameSpaces );

    debugLog = debug( 'oa:' + namespace );

  } else {

    debug.disable();

  }

  if ( namespace ) {

    logger = logger.child( lib.extend( {}, globalNamespace, { namespace: namespace } ) );

  }

  return lib.extend( log, {
    
    load: load,
    globalLoad: globalLoad,
    setPaths: setPaths
  
  });

  function log( type ) {

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

  }

  function load( values ) {

    logger = logger.child( lib.extend( {}, globalNamespace, values ) );

  }

  function globalLoad( values ) {

    logger = logger.child( lib.extend( globalNamespace, values ) );

  }

  function setPaths( newPath, newErrorPath ) {

    path = newPath;

    errorPath = newErrorPath;

  }


};