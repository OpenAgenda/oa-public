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

function init( c ) {
  config = c;

  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  mw.init( require( './index' ), c );
  aggregatorSources.init( c, knex );
}

function service( agendaId ) {

  if ( !config ) throw 'service not initialized';

  return aggregatorSources( agendaId );

}
