export default {
  mysql: {
    host: '127.0.0.1', // process.env.MYSQL_HOST
    password: 'grut',
    user: 'root',
    ssl: true,
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
};
