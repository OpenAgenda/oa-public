var config = require( '../config' ),

logger = require( 'bunyan' ).createLogger({
  name : config.name
});

exports.getLogger = getLogger;
exports.load = load;


/**
 * load log function by type and namespace. Both optionaly.
 */

function getLogger( namespace, type ) {

  if ( !type ) type = 'info';

  var currentLogger = logger;

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
    
  }

}


/**
 * load values to be part of log throughout app
 */

function load( values ) {

  logger = logger.child( values );

}