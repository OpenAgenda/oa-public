"use strict";

const path = require( 'path' );

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_test_keys',
    password: 'grut',
    user: 'root'
  },
  migrations: {
    tableName: 'keys_migrations',
    directory: path.resolve( __dirname, 'migrations' )
  },
  schemas: {
    keys: 'keys'
  }
};
