export default {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_keys',
    password: 'grut',
    user: 'root',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
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
