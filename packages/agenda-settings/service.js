const logger = require( '@openagenda/basic-logger' );
const mw = require( './middleware' );

let config;
let log;

module.exports = {
  init,
  mw
};

function init( c, cb ) {

  config = c;

  Promise.resolve( c )

    .then( () => {

      if ( c.logger ) {

        logger.setLogger( c.logger );

      }

      log = logger( 'agenda-settings' );

    } )

    .then( () => {

      mw.init( require( './service' ), c );

    } )

    .then( () => cb ? cb() : null, cb ? cb : null );
}