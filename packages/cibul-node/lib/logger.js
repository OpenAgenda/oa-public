var config = require( '../config' ),

logger = require( 'bunyan' ).createLogger({
  name : config.name,
  streams: [{
    type: 'rotating-file',
    path: config.logPath,
    period: '1d',
    count: 3
  }]
}),

debug = require( 'debug' );


exports = module.exports = getLogger;
exports.load = load;


/**
 * load log function by type and namespace. Both optionaly.
 */

function getLogger( namespace, type ) {

  var debugLog,

  currentLogger = logger;

  if ( !type ) type = 'info';

  if ( config.env !== 'prod' ) {

    debug.enable( '*' );

    debugLog = debug( namespace );

  }

  if ( namespace ) {

    currentLogger = logger.child({ namespace : namespace });

  }

  // hack to get around strange bunyan error
  return function( val, val2, val3 ) {

    if ( arguments.length == 1) {

      currentLogger[type]( val );

    } else if ( arguments.length == 2 ) {

      currentLogger[type]( val, val2 );

    } else {

      currentLogger[type]( val, val2, val3 );

    }

    if ( debugLog ) {

      debugLog.apply( null, Array.prototype.slice.call( arguments ) );

    }
    
  }

}


/**
 * load values to be part of log throughout app
 */

function load( values ) {

  logger = logger.child( values );

}