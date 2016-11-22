const logger = require( 'basic-logger' );
const knexLib = require( 'knex' );
const mw = require( '../middleware' );
const agendas = require( './agendas' );

let config;
let knex;
let log;

module.exports = Object.assign( service, {
  init,
  mw,
  getConfig: () => config
} );

function init( c, cb ) {

  config = c;

  Promise.resolve( c )

    .then( () => {

      if ( c.logger ) {

        logger.setLogger( c.logger );

      }

      log = logger( 'home' );

    } )

    .then( () => {

      knex = knexLib( {
        client: 'mysql',
        connection: c.mysql
      } );

    } )

    .then( () => {

      mw.init( require( './' ), c );
      agendas.init( c, knex );

    } )

    .then( () => cb ? cb() : null, cb ? cb : null );
}

function service( userId ) {

  if ( !config ) throw 'service not initialized';

  return {
    agendas: agendas( userId )
  };

}
