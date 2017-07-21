"use strict";

const keys = require( 'keys' );

module.exports.init = async config => {

  await keys.init( {
    mysql: config.db,
    schemas: config.schemas,
    migrations: {
      tableName: 'key_migrations'
    },
  } );

}
