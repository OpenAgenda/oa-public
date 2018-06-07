"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const logger = require( '@openagenda/logs' );

const config = {
  name: 'user',
  knex: null,
  interfaces: {}
};

module.exports = _.extend( config, { init } );

function init( c ) {

  if ( c.logger ) logger.setModuleConfig( c.logger );

  config.knex = knexLib( getKnexConfig( c ) );

  _.extend( config, _.pick( c, [
    'paginate',
    'mysql',
    'schemas',
    'files',
    'interfaces',
    'imagePath'
  ] ) );

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
