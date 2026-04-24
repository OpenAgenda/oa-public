import _ from 'lodash';
import logger from '@openagenda/logs';

export default async function makeConfig(c) {
  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return _.pick(c, [
    'knex',
    'schemas',
    'cache',
    'services',
    'interfaces',
    'types',
    'defaultAction',
    'redis',
    'queue',
    'createWorker',
    'defaultImagePath',
    'mailsDomain',
    's3',
    'mw',
    'uppyCompanion',
  ]);
}
