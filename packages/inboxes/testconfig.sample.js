"use strict";

const path = require( 'path' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_inboxes',
    password: 'grut',
    user: 'root',
    charset: 'utf8mb4',
    timezone: 'UTC'
  },
  migrations: {
    tableName: 'inbox_migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    inbox: 'inbox'
  }
};
