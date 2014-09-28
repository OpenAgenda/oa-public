var debug = require( 'debug' );

debug.enable( '*' );

exports.getLogger = getLogger;
exports.load = load;

function getLogger( namespace ) {

  return debug( namespace );

}

function load( values ) {

  // ignored.

}