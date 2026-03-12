import knexLib from 'knex';
import logs from '@openagenda/logs';

const log = logs('services/knex');

export function init(config) {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...config.db },
    pool: { min: 0, max: 20 },
    schemas: config.schemas,
  });

  config.knex = knex;

  const QUERY_TTL = 60_000;
  const queryStartTimes = new Map();

  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [uid, startTime] of queryStartTimes) {
      if (now - startTime > QUERY_TTL) {
        queryStartTimes.delete(uid);
      }
    }
  }, QUERY_TTL);
  sweepInterval.unref();

  knex.on('query', (query) => {
    queryStartTimes.set(query.__knexQueryUid, Date.now());
  });

  knex.on('query-response', (_, query) => {
    const startTime = queryStartTimes.get(query.__knexQueryUid);
    queryStartTimes.delete(query.__knexQueryUid);
    if (startTime !== undefined) {
      const duration = Date.now() - startTime;
      if (duration > 2000) {
        log.warn('slow query (ms)', {
          sql: query.sql,
          bindings: query.bindings,
          duration,
        });
      }
    }
  });

  knex.on('query-error', (error, query) => {
    queryStartTimes.delete(query.__knexQueryUid);
    log.error('Knex query error:', { error });
  });

  return Object.assign(knex, {
    shutdown: async () => {
      clearInterval(sweepInterval);
      await knex.destroy();
    },
  });
}
