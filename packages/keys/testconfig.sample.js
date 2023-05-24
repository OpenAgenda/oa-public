"use strict";

const path = require( 'path' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_keys',
    password: 'grut',
    user: 'root',
    ssl: true,
  },
  migrations: {
    tableName: 'key_migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    key: 'key'
  },
  redis: {
    connection: {
      socket: {
        host: 'localhost',
        port: 6379
      }
    }
  },
  cache: {
    duration: 60
  }
};
