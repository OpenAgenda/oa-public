'use strict';

const { promisify } = require('node:util');
const Service = require('@openagenda/activities');
const sessions = require('@openagenda/sessions');
const mw = require('@openagenda/activity-apps/dist/middleware');
const unsubscribedSvc = require('@openagenda/unsubscribed');
const sendSummary = require('./sendSummary');
const activitiesConfig = require('./activitiesConfig');

const activities = {};
const preMw = [
  sessions.mw.ifUnlogged((req, res) => res.status(400).json({ error: 'Not logged' })),
];

module.exports = app => {
  app.get('/notifications/count', preMw, mw.notifications.count);
  app.get('/notifications/list', preMw, mw.notifications.list);
  app.get('/notifications/remove/:notifId', preMw, mw.notifications.remove);
  app.get('/notifications/mark-read/:notifId', preMw, mw.notifications.markRead);
  app.get('/notifications/mark-all-read', preMw, mw.notifications.markAllRead);
};

module.exports.init = async (config, services) => {
  const service = await Service({
    knex: config.knex,
    schemas: config.schemas,
    migrations: config.enableMigrations ? {
      tableName: 'activity_migrations',
    } : null,
    redis: services.redis,
    queue: {
      names: {
        addActivity: config.queues.notificationAddActivity,
        sendSummary: config.queues.notificationSendSummary,
      },
    },
    Queues: services.queues,
    interfaces: {
      getUser: uid => services.users.get(uid, { detailed: true }),
      isUnsubscribed: uid => promisify(unsubscribedSvc(uid).is)({
        subject: 'notifications',
        type: 'notifications_summary',
      }),
      sendSummary: (...args) => sendSummary(config, ...args),
    },
    services, // used in mask
    activities: activitiesConfig,
    enableNotificationsForFeedTypes: ['user'],
    logger: config.getLogConfig('svc', 'activities', false),
  });

  service.getFormatConfig = () => {
    const result = {};

    for (const activityKey in activitiesConfig) {
      // for eslint guard-for-in
      if (!{}.hasOwnProperty.call(activitiesConfig, activityKey)) {
        continue;
      }

      const activityConfig = activitiesConfig[activityKey];
      const {
        labelId,
        labelIds,
        entities,
        tags,
      } = activityConfig;

      result[activityKey] = {
        labelId,
        labelIds,
        entities,
        tags,
      };
    }

    return result;
  };

  Object.assign(activities, service);

  Object.assign(module.exports, activities);

  return service;
};
