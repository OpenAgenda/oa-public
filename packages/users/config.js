"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const knexLib = require( 'knex' );
const logger = require( 'basic-logger' );
const images = require( 'images' );
const files = require( 'files' );

const config = {
  knex: null
};

module.exports = _.extend( config, { init } );

async function init( c ) {

  if ( c.logger ) logger.setLogger( c.logger );

  // clone or create a knex client
  config.knex = c.knex ? c.knex.clone() : knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

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
