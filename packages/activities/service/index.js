"use strict";

const knexLib = require( 'knex' );
const logger = require( 'basic-logger' );
const feed = require( './feed' );
const feeds = require( './feeds' );
const activities = require( './activities' );
const notifications = require( './notifications' );

let config;
let knex;

module.exports = {
  init,
  feed,
  feeds,
  activities,
  notifications
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) logger.setLogger( c.logger );

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  feed.init( { config, knex } );
  feeds.init( { config, knex } );
  activities.init( { config, knex } );
  notifications.init( { config, knex } );

  if ( cb ) cb();

}
