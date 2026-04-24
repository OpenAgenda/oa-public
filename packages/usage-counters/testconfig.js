export default {
  mysql: {
    host: '127.0.0.1',
    password: 'grut',
    user: 'root',
    database: 'usageCounterTest',
    ssl: { rejectUnauthorized: false },
  },

  schema: 'usage_counter',

  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
};
