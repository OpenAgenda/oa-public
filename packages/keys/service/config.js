"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const knexLib = require( 'knex' );
const logger = require( 'basic-logger' );

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

  // add migrations config to the knex client
  if ( c.migrations !== null ) {
    Object.assign( config.knex.client.config, {
      migrations: Object.assign( {}, c.migrations, {
        directory: path.resolve( path.dirname( __dirname ), 'migrations' )
      } ),
      schemas: c.schemas
    } );
  }

  _.extend( config, _.pick( c, [
    'mysql',
    'schemas'
  ] ) );

  if ( config.knex.client.config.migrations ) {
    await config.knex.migrate.latest();
  }

}