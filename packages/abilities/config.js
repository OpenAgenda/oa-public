'use strict';

const path = require( 'path' );
const _ = require( 'lodash' );
const knexLib = require( 'knex' );

const logs = require( '@openagenda/logs' );

const config = {};

function getKnexConfig( c ) {
  let knexConfig;

  if ( c.knex ) {
    knexConfig = {
      ...c.knex.client.config,
      pool: c.knex.client.pool,
      schemas: {
        ...c.knex.client.config.schemas,
        ...c.schemas
      }
    };
  } else {
    knexConfig = {
      client: 'mysql',
      connection: c.mysql,
      schemas: c.schemas
    };
  }

  if ( c.migrations ) {
    knexConfig.migrations = {
      ...( c.knex ? c.knex.client.config.migrations : {} ),
      ...c.migrations,
      directory: path.resolve( __dirname, 'migrations' )
    };
  }

  return knexConfig;
}

async function init( c = {} ) {
  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  config.knex = knexLib( getKnexConfig( c ) );

  _.extend( config, _.pick( c, [ 'mysql', 'schemas', 'migrations', 'interfaces' ] ) );
}

function migrate( options ) {
  return config.knex.migrate.latest( {
    directory: path.join( __dirname, 'migrations' ),
    ...options
  } );
}

function seed( options ) {
  const directory = typeof options === 'string'
    ? path.join( __dirname, 'seeds', options )
    : path.join( __dirname, 'seeds', options && options.scenarioName ? options.scenarioName : '' );

  return config.knex.seed.run( {
    directory,
    ...options
  } );
}

module.exports = _.extend( config, {
  init,
  migrate,
  seed,
  getConfig: () => config
} );
