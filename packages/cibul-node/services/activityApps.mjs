import activityAppsMw from '@openagenda/activity-apps/dist/middleware.js';

export function init(config, services) {
  return activityAppsMw.init({
    limit: 20,
    services: {
      activities: services.activities,
    },
    logger: config.getLogConfig('svc', 'activity-apps', false),
  });
}
