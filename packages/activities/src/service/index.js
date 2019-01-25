"use strict";

const path = require( 'path' );
const knexLib = require( 'knex' );
const logger = require( '@openagenda/logs' );
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
  shutdown,
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

async function init( c ) {

  config = c;

  logger.setModuleConfig( c.logger );

  knex = c.knex ? c.knex.clone() : knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  if ( c.migrations !== null ) {
    Object.assign( knex.client.config, {
      migrations: Object.assign( {}, c.migrations, {
        directory: path.resolve( path.dirname( __dirname ), '../migrations' )
      } ),
      schemas: config.schemas
    } );
  }


  if ( knex.client.config.migrations ) {
    await knex.migrate.latest();
  }

  feed.init( { config, knex, service: module.exports } );
  feeds.init( { config, knex, service: module.exports } );
  activities.init( { config, knex, service: module.exports } );
  notifications.init( { config, knex, service: module.exports } );

}

function shutdown() {
  return knex.destroy();
}
