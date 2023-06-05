'use strict';

const log = require('@openagenda/logs')('resetApiCounters task');

/**
 * exposed function list
 */

module.exports = (config, services) => {
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

    for await (const row of stream) {
      try {
        const count = await redis.hGet(config.api.redis.prefix + row.id, config.api.redis.publishCount);

        log.info({ message: 'api counter', keySetId: row.id, count });

        if (count) {
          await redis.hSet(config.api.redis.prefix + row.id, config.api.redis.publishCount, 0);
        }
      } catch (e) {
        log.error(e);
      }
    }
  };
};
