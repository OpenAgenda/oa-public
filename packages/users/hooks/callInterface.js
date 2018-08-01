const log = require( '@openagenda/logs' )( 'users/hooks/callInterface' );
const config = require( '../config' );


module.exports = function callInterface( name, options ) {
  return context => {
    if ( !config.interfaces || typeof config.interfaces[ name ] !== 'function' ) {
      log.info( `callInterface: interface '${name}' does not exist` );

      return context;
    }

    return config.interfaces[ name ]( options )( context );
  };
};
