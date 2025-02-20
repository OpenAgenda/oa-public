import Service from '@openagenda/activities';
import createPrepareSummaryQueue from './prepareSummary.js';
import sendSummary from './sendSummary.js';
import activitiesConfig from './activitiesConfig.js';
import addActivity from './addActivity.js';
import RebuildTasks from './tasks/rebuild.js';
import plugApp from './plugApp.js';
import mw from './middleware/index.js';

export async function init(config, services) {
  const { bull } = services;

  const prepareSummary = createPrepareSummaryQueue(services);

  const service = await Service({
    knex: config.knex,
    schemas: config.schemas,
    migrations: config.enableMigrations
      ? {
        tableName: 'activity_migrations',
      }
      : null,
    interfaces: {
      getUser: (uid) => services.users.get(uid, { detailed: true }),
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
      const { labelId, labelIds, entities, tags, detailLabelIds } = activityConfig;

      result[activityKey] = {
        labelId,
        labelIds,
        entities,
        tags,
        detailLabelIds,
      };
    }

    return result;
  };

  service.addActivity = addActivity({ bull, activities: service });
  service.prepareSummary = prepareSummary;

  Object.assign(service.tasks, RebuildTasks({ config, services }));

  return Object.assign(service, {
    mw,
    plugApp,
  });
}
