import logger from '@openagenda/logs';
import feed from './feed.js';
import feeds from './feeds/index.js';
import activities from './activities/index.js';
import notifications from './notifications/index.js';
import rebuild from './rebuild.js';

import cleanOldActivitiesTask from './activities/tasks/cleanOld.js';
import cleanOldNotificationsTask from './notifications/tasks/cleanOld.js';

export default async function Service(c) {
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
}
