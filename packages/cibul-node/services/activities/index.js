'use strict';

const Service = require('@openagenda/activities');
const mw = require('@openagenda/activity-apps/dist/middleware');
const createPrepareSummaryQueue = require('./prepareSummary');
const sendSummary = require('./sendSummary');
const activitiesConfig = require('./activitiesConfig');
const addActivity = require('./addActivity');

const activities = {};

module.exports = app => {
  const {
    sessions,
  } = app.services;
  const preMw = [
    sessions.mw.ifUnlogged((req, res) => res.status(400).json({ error: 'Not logged' })),
  ];

  app.get('/notifications/count', preMw, mw.notifications.count);
  app.get('/notifications/list', preMw, mw.notifications.list);
  app.get('/notifications/remove/:notifId', preMw, mw.notifications.remove);
  app.get('/notifications/mark-read/:notifId', preMw, mw.notifications.markRead);
  app.get('/notifications/mark-all-read', preMw, mw.notifications.markAllRead);
};

module.exports.init = async (config, services) => {
  const { bull } = services;

  const prepareSummary = createPrepareSummaryQueue({ bull, activities });

  const service = await Service({
    knex: config.knex,
    schemas: config.schemas,
    migrations: config.enableMigrations ? {
      tableName: 'activity_migrations',
    } : null,
    interfaces: {
      getUser: uid => services.users.get(uid, { detailed: true }),
      isUnsubscribed: () => false,
      prepareSummary,
      sendSummary: (...args) => sendSummary(config, services, ...args),
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

  service.addActivity = addActivity({ bull, activities });
  service.prepareSummary = prepareSummary;

  Object.assign(activities, service);

  Object.assign(module.exports, activities);

  return service;
};
