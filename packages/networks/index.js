import _ from 'lodash';
import logger from '@openagenda/logs';
import get from './get.js';
import list from './list.js';
import create from './create.js';
import update from './update.js';
import validate from './validate.js';

function Service(options = {}) {
  const config = _.assign(
    {
      knex: null,
      schema: 'network',
    },
    options,
  );

  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  return {
    get: get.bind(null, config),
    list: list.bind(null, config),
    create: create.bind(null, config),
    update: update.bind(null, config),
    patch: update.bind(null, _.assign({ patch: true }, config)),
    validate,
  };
}

Service.validate = validate;

export default Service;

export { validate };
