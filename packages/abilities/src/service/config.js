import path from 'path';
import _ from 'lodash';
import logs from '@openagenda/logs';

const config = {};

export async function init(c = {}) {
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  Object.assign(config, _.pick(
    c,
    ['mysql', 'schemas', 'migrations', 'interfaces', 'entityMapping', 'knex'],
  ));

  const {
    knex,
  } = config;

  if (c.migrations) {
    try {
      await knex.migrate.latest({
        tableName: 'inbox_migrations',
        ...c.migrations,
        directory: path.join(__dirname, '..', '..', 'migrations'),
      });
    } catch (e) {
      console.log(e);
    }
  }
}

export function migrate(options) {
  return config.knex.migrate.latest({
    directory: path.join(__dirname, '..', '..', 'migrations'),
    ...options,
  });
}

export function seed(options) {
  const directory = typeof options === 'string'
    ? path.join(__dirname, '..', '..', 'seeds', options)
    : path.join(
      __dirname,
      '..',
      '..',
      'seeds',
      options && options.scenarioName ? options.scenarioName : '',
    );

  return config.knex.seed.run({
    directory,
    ...options,
  });
}

_.extend(config, {
  init,
  migrate,
  seed,
  getConfig: () => config,
});

export default config;
