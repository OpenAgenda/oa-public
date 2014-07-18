var currentEnv = process.env.NODE_ENV || 'development';

var all = {
  port: 8901,
  logLevel: '*',
  db: {
    database: 'cibuldev',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  redis: {
    host: '127.0.0.1',
    port: 6389
  },
  session: {
    cookie: 'symfony',
    prefix: 'session:'
  }
};

module.exports = all;