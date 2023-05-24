'use strict';

const path = require('path');
const logger = require('@openagenda/logs');
const feed = require('./feed');
const feeds = require('./feeds');
const activities = require('./activities');
const notifications = require('./notifications');
const rebuild = require('./rebuild');

const cleanOldActivitiesTask = require('./activities/tasks/cleanOld')
const cleanOldNotificationsTask = require('./notifications/tasks/cleanOld')
const addActivityTask = require('./notifications/tasks/addActivity');
const prepareSummaryTask = require('./notifications/tasks/prepareSummary');
const sendSummary = require('./notifications/tasks/sendSummary');


module.exports = Service;

async function Service(c) {
  const config = c;

  config.queues = config.queues ?? {
    addActivity: c.Queues(config.queue.names.addActivity),
  };

  logger.setModuleConfig(c.logger);

  Object.assign(config.knex.client.config, {
    schemas: {
      ...config.knex.client.config.schemas,
      ...config.schemas
    }
  });


  if (c.migrations !== null) {
    Object.assign(config.knex.client.config, {
      migrations: Object.assign({}, c.migrations, {
        directory: path.resolve(path.dirname(__dirname), '../migrations')
      })
    });
  }

  if (config.knex.client.config.migrations) {
    await config.knex.migrate.latest();
  }

  const service = config.service = {};

  return Object.assign(service, {
    feed: feed.bind(null, config),
    feeds: feeds.bind(null, config),
    activities: Object.assign(
      activities.bind(null, config), // .activities( identifiers ).list
      activities(config, null) // .activities.list
    ),
    notifications: notifications.bind(null, config),
    tasks: {
      activities: {
        cleanOld: cleanOldActivitiesTask.bind(null, config)
      },
      notifications: {
        addActivity: addActivityTask(config),
        prepareSummary: prepareSummaryTask.bind(null, config),
        sendSummary: sendSummary(config),
        cleanOld: cleanOldNotificationsTask.bind(null, config)
      }
    },
    rebuild: rebuild.bind(null, config),
  });
};
