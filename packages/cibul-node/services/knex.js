import knexLib from 'knex';
import logs from '@openagenda/logs';

const log = logs('services/knex');

export function init(config) {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...config.db },
    pool: {
      min: 2,
      max: 20,
      idleTimeoutMillis: 5 * 60 * 1000,
      acquireTimeoutMillis: 30_000,
      afterCreate(conn, done) {
        conn.query('SELECT 1', (err) => done(err, conn));
      },
    },
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
    const { numUsed, numFree, numPendingAcquires } = knex.client?.pool ?? {};
    if (numPendingAcquires > 0) {
      log.warn('pool pressure', { numUsed, numFree, numPendingAcquires });
    }
  });

  knex.on('query-response', (_, query) => {
    const startTime = queryStartTimes.get(query.__knexQueryUid);
    queryStartTimes.delete(query.__knexQueryUid);
    if (startTime !== undefined) {
      const duration = Date.now() - startTime;
      if (duration > 1000) {
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
