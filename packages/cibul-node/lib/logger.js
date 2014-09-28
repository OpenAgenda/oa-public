var config = require( '../config' ),

lib; // logging lib used

if ( config.logger == 'bunyan' ) {

  lib = require( './logger-bunyan' );

} else {

  lib = require( './logger-debug' );

}

exports = module.exports = lib.getLogger;
exports.load = lib.load;