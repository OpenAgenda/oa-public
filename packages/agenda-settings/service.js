const logger = require( 'basic-logger' );
const knexLib = require( 'knex' );
const mw = require( './middleware' );

let config;
let knex;
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

      knex = knexLib( {
        client: 'mysql',
        connection: c.mysql
      } );

    } )

    .then( () => {

      mw.init( require( './index' ), c );

    } )

    .then( () => cb ? cb() : null, cb ? cb : null );
}