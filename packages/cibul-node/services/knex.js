import knexLib from 'knex';
import logs from '@openagenda/logs';
import getMigrationDirectories from '../lib/migrationDirectories.js';

const log = logs('services/knex');

export async function init(config) {
  log.setConfig(config.getLogConfig('oa', 'knexErrors'));

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...config.db },
    pool: {
      min: config.knexService.pool.min,
      max: config.knexService.pool.max,
      acquireTimeoutMillis: 30000,
      afterCreate(conn, done) {
        log.info('new connection', { threadId: conn.threadId });
        conn.query('SELECT 1', (err) => {
          if (err) return done(err, conn);

          // Ping MySQL toutes les 60s pour empêcher wait_timeout de tuer la connexion
          const pingInterval = setInterval(() => {
            conn.ping((pingErr) => {
              if (pingErr) {
                log.warn('pool ping failed', { threadId: conn.threadId });
                clearInterval(pingInterval);
              }
            });
          }, 60_000);
          pingInterval.unref();

          // Cleanup quand la connexion est détruite
          conn.on('end', () => {
            log.warn('connection closed', { threadId: conn.threadId });
            clearInterval(pingInterval);
          });

          done(null, conn);
        });
      },
    },
    schemas: config.schemas,
  });

  // Pré-remplir le pool pour forcer la création de min connexions
  const { pool } = knex.client;
  const acquired = await Promise.all(
    Array.from(
      { length: config.knexService.pool.min },
      () => pool.acquire().promise,
    ),
  );
  for (const conn of acquired) {
    pool.release(conn);
  }
  log.info('pool warmed', { connections: acquired.length });

  if (!config.disableMigrationsCheck) {
    const directories = getMigrationDirectories(config);
    if (directories.length > 0) {
      const [, pending] = await knex.migrate.list({ directory: directories });
      if (pending.length > 0) {
        log.error('migrations pending, refusing to start', {
          pending: pending.map((p) => p.file ?? p),
        });
        process.exit(1);
      }
    }
  }

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
