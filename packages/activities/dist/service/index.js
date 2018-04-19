"use strict";

var path = require('path');
var knexLib = require('knex');
var logger = require('@openagenda/logs');
var feed = require('./feed');
var feeds = require('./feeds');
var activities = require('./activities');
var notifications = require('./notifications');

var addActivityTask = require('./notifications/tasks/addActivity');
var prepareSummaryTask = require('./notifications/tasks/prepareSummary');

var _require = require('./notifications/tasks/sendSummary'),
    sendSummaryTask = _require.task;

var config = void 0;
var knex = void 0;

module.exports = {
  init: init,
  feed: feed,
  feeds: feeds,
  activities: activities,
  tasks: {
    notifications: {
      addActivity: addActivityTask,
      prepareSummary: prepareSummaryTask,
      sendSummary: sendSummaryTask
    }
  }
};

async function init(c) {

  config = c;

  logger.setModuleConfig(c.logger);

  knex = c.knex ? c.knex.clone() : knexLib({
    client: 'mysql',
    connection: c.mysql
  });

  if (c.migrations !== null) {
    Object.assign(knex.client.config, {
      migrations: Object.assign({}, c.migrations, {
        directory: path.resolve(path.dirname(__dirname), '../migrations')
      }),
      schemas: config.schemas
    });
  }

  if (knex.client.config.migrations) {
    await knex.migrate.latest();
  }

  feed.init({ config: config, knex: knex, service: module.exports });
  feeds.init({ config: config, knex: knex, service: module.exports });
  activities.init({ config: config, knex: knex, service: module.exports });
  notifications.init({ config: config, knex: knex, service: module.exports });
}
//# sourceMappingURL=index.js.map