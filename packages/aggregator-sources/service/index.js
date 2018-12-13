const logs = require( '@openagenda/logs' );
const knexLib = require( 'knex' );
const mw = require( '../middleware' );
const aggregatorSources = require( './aggregatorSources' );

let config;
let knex;

module.exports = Object.assign( service, {
  init,
  mw
} );

function init( c, cb ) {

  config = c;

  Promise.resolve( {} )

    .then( () => {

      if ( c.logger ) {

        logs.setModuleConfig( c.logger );

      }

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
