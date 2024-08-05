'use strict';

const logger = require('@openagenda/logs');

const name = require('../package.json').name.split('/').pop();
const router = require('./router');

module.exports = Object.assign(
  (config = {}) => {
    let eventSchema;

    if (config.logger) {
      logger.setModuleConfig(config.logger);
    }

    return {
      name,
      config,
      ...config.interfaces,
      getEventSchema: async () => {
        if (!eventSchema) {
          eventSchema = await config.interfaces.getEventSchema();
        }
        return eventSchema;
      },
    };
  },
  {
    router,
  },
);
