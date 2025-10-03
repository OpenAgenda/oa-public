export default {
  mysql: {
    host: '127.0.0.1',
    user: 'root',
    password: 'grut',
    database: 'oatest_controldata',
    jsonStrings: true,
    ssl: { rejectUnauthorized: false },
  },
  redisPrefix: 'testControlData:',
};
