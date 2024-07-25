import knexLib from 'knex';
import logs from '@openagenda/logs';

const log = logs('services/knex');

export function init(config) {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql',
    connection: config.db,
    pool: { min: 0, max: 20 },
    schemas: config.schemas,
  });

  config.knex = knex;

  knex.on('query-error', error => {
    log.error('Knex query error:', { error });
  });

  return Object.assign(knex, {
    shutdown: async () => {
      await knex.destroy();
    },
  });
}
