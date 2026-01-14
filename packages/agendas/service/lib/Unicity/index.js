'use strict';

const logs = require('@openagenda/logs');

const log = logs('unicity');

module.exports = function Unicity(tableColumn, config) {
  // Initialize with provided configuration
  const {
    setName,
    client,
    redis,
    generate,
    lockRetryDelay = 10,
    lockMaxRetries = 100,
    generateMaxRetries = 1000,
  } = config;

  let heldValue = null;
  const lockKey = `${setName}:lock`;
  const lockTimeout = 5000; // 5 seconds maximum lock duration

  // Private method to acquire Redis lock
  async function acquireLock() {
    const lockValue = `${Date.now()}-${Math.random()}`;
    const acquired = await redis.set(
      lockKey,
      lockValue,
      'PX',
      lockTimeout,
      'NX',
    );
    return acquired ? lockValue : null;
  }

  // Private method to release Redis lock
  async function releaseLock(lockValue) {
    // Use Lua script to ensure we only delete our own lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(script, 1, lockKey, lockValue);
  }

  // Private method to execute operation with lock and retry mechanism
  async function withLock(operation) {
    let retries = 0;

    log('withLock: acquiring lock');
    while (retries < lockMaxRetries) {
      const lockValue = await acquireLock();

      if (lockValue) {
        let result;
        log('withLock: acquired lock');
        try {
          result = await operation();
        } finally {
          log('withLock: releasing lock');
          await releaseLock(lockValue);
        }
        return result;
      }

      // Lock not acquired, wait before retry
      await new Promise((resolve) => setTimeout(resolve, lockRetryDelay));
      retries += 1;
    }

    throw new Error(`Failed to acquire lock after ${lockMaxRetries} retries`);
  }

  // Private method to check if value is available in database
  async function checkDatabaseAvailability(value) {
    const [table, column] = tableColumn.split('.');
    const result = await client(table).where(column, value).first();
    return !result;
  }

  // Private method to check if value is available in Redis (with lock)
  async function checkRedisAvailability(value, options = {}) {
    if (options.withLock) {
      return withLock(
        async () => await redis.sismember(setName, value) === 0,
      );
    }
    return await redis.sismember(setName, value) === 0;
  }

  // Public methods
  async function generateAndHold(seed) {
    let value;
    log('generateAndHold: acquiring lock');
    // Hold the value in memory and Redis (with lock)
    await withLock(async () => {
      log('generateAndHold: lock aquired');
      let available;

      // If value is not available, generate a new one until we find an available one
      let iterations = 0;
      do {
        value = generate(seed, iterations > 0);
        available = await checkDatabaseAvailability(value)
          && await checkRedisAvailability(value, { withLock: false });
        iterations += 1;

        if (iterations >= generateMaxRetries) {
          throw new Error('max retries on generation of unique value');
        }
      } while (!available);

      heldValue = value;
      await redis.sadd(setName, value);
    });

    return value;
  }

  async function get() {
    return heldValue;
  }

  async function release() {
    if (heldValue) {
      await withLock(async () => {
        await redis.srem(setName, heldValue);
      });
      heldValue = null;
      return true;
    }
    return false;
  }

  function clone() {
    return Unicity(tableColumn, config);
  }

  async function isAvailable(value) {
    const isDBAvailable = await checkDatabaseAvailability(value);
    const isRedisAvailable = await checkRedisAvailability(value, {
      withLock: true,
    });

    return isDBAvailable && isRedisAvailable;
  }

  async function holdIfAvailable(value) {
    if (heldValue === value) {
      log('holdIfAvailable: held value is already provided value -> true', {
        value,
      });
      return true;
    }

    let available = false;

    await withLock(async () => {
      if (!await checkDatabaseAvailability(value)) {
        log('holdIfAvailable: database already has match, not holding', {
          value,
        });
        available = false;
        return;
      }

      available = await redis.sismember(setName, value) === 0;

      if (available) {
        log('holdIfAvailable: is available, holding', { value });
        heldValue = value;
        await redis.sadd(setName, value);
      } else {
        log('holdIfAvailable: is not available', { value });
      }
    });

    return available;
  }

  async function destroy() {
    if (heldValue) {
      await release();
    }
  }

  // Return public methods
  return {
    generateAndHold,
    get,
    release,
    clone,
    isAvailable,
    holdIfAvailable,
    destroy,
  };
};
