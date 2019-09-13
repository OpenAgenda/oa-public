"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const knexLib = require( 'knex' );
const redis = require( 'redis' );
const logs = require( '@openagenda/logs' );
const promisifyRedis = require( '@openagenda/service-utils/promisifyRedis' );

const log = require( '@openagenda/logs' )( 'config' );

const config = {
  knex: null,
  redis: {
    prefix: 'keys'
  }
};

module.exports = _.extend( config, { init } );

async function init( c ) {

  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  _.merge( config, _.pick( c, [
    'mysql',
    'schemas',
    'redis',
    'cache'
  ] ) );

  // clone or create a knex client
  config.knex = knexLib( getKnexConfig( c ) );

  // add migrations config to the knex client
  if ( c.migrations !== null ) {
    Object.assign( config.knex.client.config, {
      migrations: Object.assign( {}, c.migrations, {
        directory: path.resolve( path.dirname( __dirname ), 'migrations' )
      } ),
      schemas: c.schemas
    } );
  }

  config.redis.client = c.redis.client || redis.createClient( c.redis.connection );

  promisifyRedis( config.redis.client );

  if ( config.knex.client.config.migrations ) {
    try {
      await config.knex.migrate.latest();
    } catch ( e ) {
      log( 'error', 'failed to migrate to latest', e );
    }
  }

}

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
      ...(c.knex ? c.knex.client.config.migrations : {}),
      ...c.migrations,
      directory: path.resolve( path.dirname( __dirname ), 'migrations' )
    }
  }

  return knexConfig;
}
