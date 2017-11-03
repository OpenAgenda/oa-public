"use strict";

const keys = require( '@openagenda/keys' );

module.exports.init = async config => {

  await keys.init( {
    mysql: config.db,
    schemas: config.schemas,
    migrations: {
      tableName: 'key_migrations'
    },
    redis: {
      connection: config.redis
    },
    cache: {
      duration: 60
    }
  } );

}
