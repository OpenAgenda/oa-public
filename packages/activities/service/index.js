"use strict";

const knexLib = require( 'knex' );
const logger = require( 'basic-logger' );
const feed = require( './feed' );

let config;
let knex;

module.exports = {
  init,
  feed
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) logger.setLogger( c.logger );

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  module.exports.feed.init( c );

  if ( cb ) cb();

}
