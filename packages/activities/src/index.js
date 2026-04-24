'use strict';

const logger = require('@openagenda/logs');
const feed = require('./feed');
const feeds = require('./feeds');
const activities = require('./activities');
const notifications = require('./notifications');
const rebuild = require('./rebuild');

const cleanOldActivitiesTask = require('./activities/tasks/cleanOld');
const cleanOldNotificationsTask = require('./notifications/tasks/cleanOld');

module.exports = async function Service(c) {
  const config = {
    ...c,
    service: {},
  };

  logger.setModuleConfig(c.logger);

  Object.assign(config.knex.client.config, {
    schemas: {
      ...config.knex.client.config.schemas,
      ...config.schemas,
    },
  });

  return Object.assign(config.service, {
    feed: feed.bind(null, config),
    feeds: feeds.bind(null, config),
    activities: Object.assign(
      activities.bind(null, config), // .activities( identifiers ).list
      activities(config, null), // .activities.list
    ),
    notifications: notifications.bind(null, config),
    tasks: {
      activities: {
        cleanOld: cleanOldActivitiesTask.bind(null, config),
      },
      notifications: {
        cleanOld: cleanOldNotificationsTask.bind(null, config),
      },
    },
    rebuild: rebuild.bind(null, config),
  });
};
