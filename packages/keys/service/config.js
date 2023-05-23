"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const redis = require( 'redis' );
const logs = require( '@openagenda/logs' );

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

  config.knex = c.knex;

  Object.assign(config.knex.client.config, {
    schemas: {
      ...config.knex.client.config.schemas,
      ...config.schemas
    }
  });

  // add migrations config to the knex client
  if (c.migrations !== null) {
    Object.assign(config.knex.client.config, {
      migrations: Object.assign({}, c.migrations, {
        directory: path.resolve(path.dirname(__dirname), 'migrations')
      })
    });
  }

  if (c.redis.client) {
    config.redis.client = c.redis.client
  } else {
    config.redis.client = redis.createClient( c.redis.connection );

    await config.redis.client.connect();
  }

  

  if ( config.knex.client.config.migrations ) {
    try {
      await config.knex.migrate.latest();
    } catch ( e ) {
      log( 'error', 'failed to migrate to latest', e );
    }
  }

}
