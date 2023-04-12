import path from 'path';
import _ from 'lodash';
import logger from '@openagenda/logs';

export default async function makeConfig(c) {
  const {
    knex,
  } = c;

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
    'queues',
    'defaultImagePath',
    'domain',
    'aws',
    'mw',
    'uppy',
  ]);

  if (c.migrations) {
    try {
      await knex.migrate.latest({
        tableName: 'inbox_migrations',
        ...c.migrations,
        directory: path.resolve(path.dirname(__dirname), 'migrations'),
      });
    } catch (e) {
      console.log(e);
    }
  }

  return config;
}
