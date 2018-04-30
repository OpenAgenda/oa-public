"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const logs = require( '@openagenda/logs' );

const log = logs( 'init' );


let ownedConnection = false;

const config = {
  knex: null
};

module.exports = _.extend( config, {
  init,
  shutdown,
  getConfig
} );


function getConfig() {

  return config;

}

function shutdown() {

  if ( !ownedConnection ) return;

  return config.knex.destroy();

}

function init( c ) {

  if ( !c.knex ) {

    config.knex = knexLib( {
      client: 'mysql',
      connection: c.mysql
    } );

    ownedConnection = true;

  }

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

  _.extend( config, _.pick( c, [ 
    'knex', 
    'schemas',
    'interfaces',
    'legacy'
  ] ) );

}