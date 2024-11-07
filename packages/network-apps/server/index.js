import logger from '@openagenda/logs';
import packageJson from '../package.json' with { type: 'json' };
import router from './router.js';

const name = packageJson.name.split('/').pop();

export default Object.assign(
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
