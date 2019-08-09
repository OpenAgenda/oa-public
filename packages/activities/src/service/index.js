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
const sendSummary = require( './notifications/tasks/sendSummary' );


module.exports = Service;

async function Service( c ) {
  const config = {
    ...c,
    knex: c.knex ? c.knex.clone() : knexLib( {
      client: 'mysql',
      connection: c.mysql
    } )
  };

  logger.setModuleConfig( c.logger );

  if ( c.migrations !== null ) {
    Object.assign( config.knex.client.config, {
      migrations: Object.assign( {}, c.migrations, {
        directory: path.resolve( path.dirname( __dirname ), '../migrations' )
      } ),
      schemas: c.schemas
    } );
  }

  if ( config.knex.client.config.migrations ) {
    await config.knex.migrate.latest();
  }

  const service = config.service = {};

  return Object.assign( service, {
    shutdown: () => config.knex.destroy(),
    feed: feed.bind( null, config ),
    feeds: feeds.bind( null, config ),
    activities: Object.assign(
      activities.bind( null, config ), // .activities( identifiers ).list
      activities( config, null ) // .activities.list
    ),
    notifications: notifications.bind( null, config ),
    tasks: {
      notifications: {
        addActivity: addActivityTask( config ),
        prepareSummary: prepareSummaryTask.bind( null, config ),
        sendSummary: sendSummary( config )
      }
    }
  } );
};
