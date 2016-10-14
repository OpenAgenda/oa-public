const logger = require( 'basic-logger' );

const matchAppMw = require( 'react-utils/dist/matchAppMw' );
const createStore = require( 'react-utils/dist/createStore' );
const ApiClient = require( 'react-utils/dist/ApiClient' );

const getRoutes = require( '../react/dist/routes' );
const reducer = require( '../react/dist/redux/reducer' );

let service, config, log;

module.exports = {
  init,
  matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient )
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'home' );

}
