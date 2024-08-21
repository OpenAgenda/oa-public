import Service from '@openagenda/activities';
import mw from '@openagenda/activity-apps/dist/middleware.js';
import createPrepareSummaryQueue from './prepareSummary.js';
import sendSummary from './sendSummary.js';
import activitiesConfig from './activitiesConfig.js';
import addActivity from './addActivity.js';
import RebuildTasks from './tasks/rebuild.js';

const activities = {};

export default function plugApp(app) {
  const { sessions } = app.services;
  const preMw = [
    sessions.mw.ifUnlogged((req, res) =>
      res.status(400).json({ error: 'Not logged' })),
  ];

  app.get('/notifications/count', preMw, mw.notifications.count);
  app.get('/notifications/list', preMw, mw.notifications.list);
  app.get('/notifications/remove/:notifId', preMw, mw.notifications.remove);
  app.get(
    '/notifications/mark-read/:notifId',
    preMw,
    mw.notifications.markRead,
  );
  app.get('/notifications/mark-all-read', preMw, mw.notifications.markAllRead);
}

export async function init(config, services) {
  const { bull } = services;

  const prepareSummary = createPrepareSummaryQueue({ bull, activities });

  const service = await Service({
    knex: config.knex,
    schemas: config.schemas,
    migrations: config.enableMigrations
      ? {
        tableName: 'activity_migrations',
      }
      : null,
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
      const { labelId, labelIds, entities, tags } = activityConfig;

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
  Object.assign(activities.tasks, RebuildTasks({ config, services }));

  // plugApp = module.exports
  Object.assign(plugApp, activities);

  return service;
}
