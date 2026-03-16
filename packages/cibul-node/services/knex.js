import knexLib from 'knex';
import logs from '@openagenda/logs';

const log = logs('services/knex');

export function init(config, services) {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...config.db },
    pool: {
      min: 2,
      max: config.knexService.connectionPoolMax,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
      afterCreate(conn, done) {
        conn.query('SELECT 1', (err) => done(err, conn));
      },
    },
    schemas: config.schemas,
  });

  config.knex = knex;

  const acquireStartTimes = new Map();
  const connectionAcquireDurations = new Map();

  knex.client.pool.on('acquireRequest', (eventId) => {
    acquireStartTimes.set(eventId, Date.now());
  });

  knex.client.pool.on('acquireSuccess', (eventId, resource) => {
    const startTime = acquireStartTimes.get(eventId);
    acquireStartTimes.delete(eventId);
    if (startTime !== undefined) {
      connectionAcquireDurations.set(
        resource.__knexUid,
        Date.now() - startTime,
      );
    }
  });

  knex.client.pool.on('acquireFail', (eventId) => {
    acquireStartTimes.delete(eventId);
  });

  const QUERY_TTL = 60_000;
  const queryStartTimes = new Map();

  const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [uid, entry] of queryStartTimes) {
      if (now - entry.startTime > QUERY_TTL) {
        queryStartTimes.delete(uid);
      }
    }
    for (const [eventId, startTime] of acquireStartTimes) {
      if (now - startTime > QUERY_TTL) {
        acquireStartTimes.delete(eventId);
      }
    }
  }, QUERY_TTL);
  sweepInterval.unref();

  const POOL_LOG_INTERVAL = 10_000;
  let lastPoolLog = 0;

  knex.on('query', (query) => {
    const acquireDuration = connectionAcquireDurations.get(query.__knexUid);
    connectionAcquireDurations.delete(query.__knexUid);
    queryStartTimes.set(query.__knexQueryUid, {
      startTime: Date.now(),
      acquireDuration,
    });
    const numPendingAcquires = knex.client.pool?.numPendingAcquires();
    const now = Date.now();
    if (!numPendingAcquires && now - lastPoolLog <= POOL_LOG_INTERVAL) {
      return;
    }
    lastPoolLog = now;
    log.info(numPendingAcquires > 0 ? 'pool pressure' : 'pool state', {
      numUsed: knex.client.pool?.numUsed(),
      numFree: knex.client.pool?.numFree(),
      numPendingAcquires,
      numPendingCreates: knex.client.pool?.numPendingCreates(),
    });
  });

  knex.on('query-response', (_, query) => {
    const entry = queryStartTimes.get(query.__knexQueryUid);
    queryStartTimes.delete(query.__knexQueryUid);
    if (entry === undefined) {
      return;
    }
    const duration = Date.now() - entry.startTime;
    if (duration <= config.knexService.slowLogThreshold) {
      return;
    }
    log.warn('slow query (ms)', {
      sql: query.sql,
      bindings: query.bindings,
      duration,
      acquireDuration: entry.acquireDuration,
    });
  });

  knex.on('query-error', (error, query) => {
    queryStartTimes.delete(query.__knexQueryUid);
    log.error('Knex query error:', { error });
  });

  // Dans knex.js, après l'init du pool
  const LAG_INTERVAL = 1000;
  let lastLagCheck = Date.now();

  const lagInterval = setInterval(() => {
    const now = Date.now();
    const lag = now - lastLagCheck - LAG_INTERVAL;
    lastLagCheck = now;
    if (lag > 100) {
      log.warn('event loop lag', {
        lag,
        host: services.monitor?.processInfo?.hostname,
        processName: services.monitor?.processInfo?.processName,
      });
    }
  }, LAG_INTERVAL);
  lagInterval.unref();

  return Object.assign(knex, {
    shutdown: async () => {
      clearInterval(sweepInterval);
      await knex.destroy();
    },
    monitorRTT: () => {
      const networkPingInterval = setInterval(async () => {
        const start = Date.now();
        try {
          await knex.raw('SELECT 1');
          const rtt = Date.now() - start;
          if (rtt > 50) {
            // seuil d'alerte en ms
            log.warn('high network RTT', { rtt });
          } else {
            log.info('network RTT', { rtt });
          }
        } catch (err) {
          log.error('ping failed', { error: err });
        }
      }, 10_000);
      networkPingInterval.unref();
    },
  });
}
