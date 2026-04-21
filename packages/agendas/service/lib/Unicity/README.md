# Unicity Documentation

## Overview

Unicity is a utility class designed to ensure the uniqueness of values, particularly in the context of database operations. It interacts with both MySQL (via Knex) and Redis (via IORedis) to manage and verify the uniqueness of values.

## Initialization

Unicity is initialized with a configuration object that includes the following properties:

- `setName`: The name of the Redis set where values are stored.
- `expiry`: The expiry time for values stored in Redis.
- `client`: The Knex client for interacting with the MySQL database.
- `redis`: The IORedis client for interacting with Redis.
- `generate`: A function that generates a unique value based on a seed.
- `filter`: (optional) A function that receives the knex query builder used to check database availability and can add additional predicates (e.g. `(q) => q.whereNull('deleted_at')` to ignore soft-deleted rows).
- `lockRetryDelay`: (optional) The delay in milliseconds between lock acquisition attempts. Default: 10ms.
- `lockMaxRetries`: (optional) The maximum number of lock acquisition attempts before throwing an error. Default: 100.

Example initialization:

```javascript
const unicity = Unicity('agenda.slug', {
  setName: 'unicity',
  expiry: 1000,
  client: knexClient,
  redis: redisClient,
  generate: (seed, randomize = false) => {
    const slug = slugify(seed || '', { lower: true, strict: true });
    return randomize ? `${slug}-${Math.ceil(Math.random() * 1000)}` : slug;
  },
  lockRetryDelay: 10, // optional: delay between lock retries in ms
  lockMaxRetries: 100, // optional: max number of lock attempts
});
```

## Methods

### `generateAndHold(seed)`

Generates a unique value based on the provided seed and holds it in both local memory and Redis. The value is stored in the Redis set named after the value provided at initialization. The uniqueness of the value is checked against the provided database table and column (ex: 'agenda.slug' means the column 'slug' of the table 'agenda') and the redis set.

Example:

```javascript
const slug = await unicity.generateAndHold('another-unique-slug');
```

### `get()`

Gets the held value.

Example:

```javascript
const value = await unicity.get();
```

### `release()`

Releases the held value from both local memory and Redis. Returns `true` if a value was released, `false` otherwise. The value in local memory is reinitialized to `null` and the released value is removed from the redis set.

Example:

```javascript
const released = await unicity.release();
```

### `clone()`

Creates another instance of Unicity with the same configuration but initialized and holding no value (in-memory value is null).

Example:

```javascript
const otherUnicity = unicity.clone();
```

### `isAvailable(value)`

Checks if the provided value is available for use. Returns `false` if the value is found in the database or is already held by another instance.

Example:

```javascript
const available = await unicity.isAvailable('some-unique-slug');
```

### `destroy()`

Destroys the Unicity instance and releases any held values.

Example:

```javascript
await unicity.destroy();
```

## Usage

Unicity is used to ensure that values are unique across the application. It is particularly useful in scenarios where you need to generate unique identifiers or slugs for database entries. The class leverages both Redis for fast in-memory checks and MySQL for persistent storage.

### Redis Lock Mechanism

To prevent race conditions when multiple Unicity instances operate simultaneously, all Redis operations are protected by a distributed lock mechanism:

- **Lock Key**: Each Unicity instance uses a shared lock key based on the `setName` (e.g., `unicity:lock`)
- **Lock Timeout**: Locks automatically expire after 5 seconds to prevent deadlocks
- **Retry Logic**: If a lock is already held, operations will retry with configurable delay and max attempts
- **Atomic Operations**: Lock acquisition and release use Redis atomic operations to ensure consistency

The lock mechanism is automatically applied to:

- [`checkRedisAvailability()`](service/lib/Unicity/index.js:61) - Checking if a value exists in Redis
- [`generateAndHold()`](service/lib/Unicity/index.js:79) - Adding a value to Redis
- [`release()`](service/lib/Unicity/index.js:98) - Removing a value from Redis
- [`isAvailable()`](service/lib/Unicity/index.js:113) - Checking availability across database and Redis

Example workflow:

1. Initialize Unicity with the required configuration.
2. Use `generateAndHold` to generate and hold a unique value.
3. Use `get` to retrieve the held value.
4. Use `release` to release the held value when it is no longer needed.
5. Use `clone` to create another instance of Unicity with the same configuration.
6. Use `isAvailable` to check if a value is available for use.
7. Use `destroy` to clean up the Unicity instance.

## Integration with Database and Redis

Unicity integrates with both MySQL and Redis to ensure the uniqueness of values. It uses Knex for MySQL operations and IORedis for Redis operations. The `generate` function is used to generate unique values based on a seed, and the `isAvailable` method is used to check if a value is available for use.

## Conclusion

Unicity is a powerful utility class that ensures the uniqueness of values in a distributed system. It leverages both Redis for fast in-memory checks and MySQL for persistent storage, making it suitable for applications that require high availability and scalability.
