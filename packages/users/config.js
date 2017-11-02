"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const logger = require( '@openagenda/basic-logger' );
const images = require( '@openagenda/images' );
const files = require( '@openagenda/files' );

const config = {
  knex: null
};

module.exports = _.extend( config, { init } );

async function init( c ) {

  if ( c.logger ) logger.setLogger( c.logger );

  config.knex = knexLib( getKnexConfig( c ) );

  _.extend( config, _.pick( c, [
    'mysql',
    'schemas',
    'files',
    'interfaces'
  ] ) );

  images.init( {
    tmpPath: config.files.tmpPath,
    logger: logger
  } );

  files.init( {
    bucket: config.files.bucket,
    accessKeyId: config.files.accessKeyId, // required
    secretAccessKey: config.files.secretAccessKey, // required too
    logger: logger
  } );

}

function getKnexConfig( c ) {
  let knexConfig;

  if ( c.knex ) {
    knexConfig = Object.assign( {}, c.knex.client.config, {
      pool: c.knex.client.pool,
      schemas: Object.assign( {}, c.knex.client.config.schemas, c.schemas )
    } );
  } else {
    knexConfig = {
      client: 'mysql',
      connection: c.mysql,
      schemas: c.schemas
    };
  }

  return knexConfig;
}
