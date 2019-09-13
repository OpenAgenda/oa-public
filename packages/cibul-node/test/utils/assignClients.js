"use strict";

const knex = require( 'knex' );
const redis = require( 'redis' );

module.exports = c => Object.assign( c, {
  knex: knex( {
    client: 'mysql',
    connection: c.db,
  } ),
  redisClient: redis.createClient()
} );
