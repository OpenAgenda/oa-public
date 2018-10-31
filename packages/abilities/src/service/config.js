import path from 'path';
import knexLib from 'knex';
import _ from 'lodash';
import logs from '@openagenda/logs';

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
      directory: path.join( __dirname, '..', '..', 'migrations' )
    };
  }

  return knexConfig;
}

export function init( c = {} ) {
  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  config.knex = knexLib( getKnexConfig( c ) );

  _.extend(
    config,
    _.pick( c, [
      'mysql',
      'schemas',
      'migrations',
      'interfaces',
      'entityMapping',
      'editableRules'
    ] )
  );
}

export function migrate( options ) {
  return config.knex.migrate.latest( {
    directory: path.join( __dirname, '..', '..', 'migrations' ),
    ...options
  } );
}

export function seed( options ) {
  const directory = typeof options === 'string'
    ? path.join( __dirname, '..', '..', 'seeds', options )
    : path.join(
      __dirname,
      '..',
      '..',
      'seeds',
      options && options.scenarioName ? options.scenarioName : ''
    );

  return config.knex.seed.run( {
    directory,
    ...options
  } );
}

_.extend( config, {
  init,
  migrate,
  seed,
  getConfig: () => config
} );

export default config;
