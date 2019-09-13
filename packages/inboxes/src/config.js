import _ from 'lodash';
import path from 'path';
import knexLib from 'knex';
import logger from '@openagenda/logs';

const config = {
  knex: null
};

module.exports = _.extend( config, { init } );

async function init( c ) {

  if ( c.logger ) logger.setModuleConfig( c.logger );

  _.merge( config, _.pick( c, [
    'mysql',
    'schemas',
    'cache',
    'services',
    'interfaces',
    'types',
    'defaultAction',
    'redis',
    'queues',
    'defaultImagePath',
    'domain',
    'aws'
  ] ) );

  const knexConfig = getKnexConfig( c );
  config.knex = knexLib( knexConfig );

  if ( c.migrations ) {
    await config.knex.migrate.latest();
  }
}

function getKnexConfig( c ) {
  let knexConfig;

  if ( c.knex ) {
    knexConfig = {
      ...c.knex.client.config,
      pool: _.pick( c.knex.client.pool, 'min', 'max' ),
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
