const logger = require( '@openagenda/basic-logger' );
const knexLib = require( 'knex' );
const mw = require( '../middleware' );
const aggregatorSources = require( './aggregatorSources' );

let config;
let knex;
let log;

module.exports = Object.assign( service, {
  init,
  mw
} );

function init( c, cb ) {

  config = c;

  Promise.resolve( {} )

    .then( () => {

      if ( c.logger ) {

        logger.setLogger( c.logger );

      }

      log = logger( 'aggregator-sources' );

    } )

    .then( () => {

      knex = knexLib( {
        client: 'mysql',
        connection: c.mysql
      } );

    } )

    .then( () => {

      mw.init( require( './index' ), c );
      aggregatorSources.init( c, knex );

    } )

    .then( () => cb ? cb() : null, cb ? cb : null );
}

function service( agendaId ) {

  if ( !config ) throw 'service not initialized';

  return aggregatorSources( agendaId );

}
