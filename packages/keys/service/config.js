"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const knexLib = require( 'knex' );
const redis = require( 'redis' );
const logger = require( 'basic-logger' );
const promisifyRedis = require( 'service-utils/promisifyRedis' );

const config = {
  knex: null,
  redis: {
    prefix: 'keys'
  }
};

module.exports = _.extend( config, { init } );

async function init( c ) {

  if ( c.logger ) logger.setLogger( c.logger );

  _.merge( config, _.pick( c, [
    'mysql',
    'schemas',
    'redis',
    'cache'
  ] ) );

  // clone or create a knex client
  config.knex = c.knex ? c.knex.clone() : knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

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
    await config.knex.migrate.latest();
  }

}
