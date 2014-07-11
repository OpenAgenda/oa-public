var currentEnv = process.env.NODE_ENV || 'development';

var all = {
  port: 8901,
  logLevel: '*',
  db: {
    database: 'cibuldev',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  }
}

module.exports = all;