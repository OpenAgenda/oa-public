export default {
  mysql: {
    database: 'oatest_aggregators',
    host: 'localhost',
    user: 'root',
    password: 'grut',
    timezone: 'Z',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  schemas: {
    aggregator: 'aggregator',
    aggregatorSource: 'aggregator_source',
  },
};
