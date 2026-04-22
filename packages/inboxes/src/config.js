import path from 'node:path';
import _ from 'lodash';
import logger from '@openagenda/logs';

export default async function makeConfig(c) {
  const { knex } = c;

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  const config = _.pick(c, [
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

  if (c.migrations) {
    await knex.migrate.latest({
      ...c.migrations,
      directory: path.resolve(path.dirname(import.meta.dirname), 'migrations'),
    });
  }

  return config;
}
