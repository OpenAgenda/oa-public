"use strict";

const path = require( 'path' );
const knexLib = require( 'knex' );
const logger = require( 'basic-logger' );
const feed = require( './feed' );
const feeds = require( './feeds' );
const activities = require( './activities' );
const notifications = require( './notifications' );

const addActivityTask = require( './notifications/tasks/addActivity' );
const prepareSummaryTask = require( './notifications/tasks/prepareSummary' );
const { task: sendSummaryTask } = require( './notifications/tasks/sendSummary' );

let config;
let knex;

module.exports = {
  init,
  feed,
  feeds,
  activities,
  tasks: {
    notifications: {
      addActivity: addActivityTask,
      prepareSummary: prepareSummaryTask,
      sendSummary: sendSummaryTask
    }
  }
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) logger.setLogger( c.logger );

  knex = knexLib( {
    client: 'mysql',
    connection: c.mysql,
    migrations: Object.assign( {}, config.migrations, {
      directory: path.resolve( path.dirname( __dirname ), 'migrations' )
    } ),
    schemas: config.schemas
  } );

  return knex.migrate.latest()
    .then( () => {

      feed.init( { config, knex, logger, service: module.exports } );
      feeds.init( { config, knex, logger, service: module.exports } );
      activities.init( { config, knex, logger, service: module.exports } );
      notifications.init( { config, knex, logger, service: module.exports } );

      if ( cb ) cb();

    } );

}
