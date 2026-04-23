import path from 'node:path';

export default {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_keys',
    password: 'grut',
    user: 'root',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    tableName: 'key_migrations',
    directory: path.resolve(import.meta.dirname, 'migrations'),
  },
  schemas: {
    key: 'key',
    apiKeySet: 'api_key_set',
  },
  redis: {
    prefix: 'keys',
    connection: {
      host: 'localhost',
      port: 6379,
    },
  },
  cache: {
    duration: 60,
  },
};
