import logs from '@openagenda/logs';

const log = logs('resetApiCounters task');

/**
 * exposed function list
 */

export default (config, services) => {
  let running = false;

  return async () => {
    if (running) {
      log('info', 'already running');
      return;
    }

    log('running');
    running = true;

    const { knex, redis } = services;

    const stream = knex('api_key_set').select('id').stream();

    try {
      for await (const row of stream) {
        try {
          const count = await redis.hget(
            config.api.redis.prefix + row.id,
            config.api.redis.publishCount,
          );

          log.info({ message: 'api counter', keySetId: row.id, count });

          if (count) {
            await redis.hset(
              config.api.redis.prefix + row.id,
              config.api.redis.publishCount,
              0,
            );
          }
        } catch (e) {
          log.error(e);
        }
      }
    } catch (e) {
      log.error('stream error', e);
    } finally {
      if (!stream.destroyed) stream.destroy();
      running = false;
    }
  };
};
