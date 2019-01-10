"use strict";

const promisifyRedis = require( './lib/utils/promisifyRedis' );

const batch = require( './lib/batch' );
const insert = require( './lib/insert' );
const remove = require( './lib/remove' );
const set = require( './lib/set' );
const update = require( './lib/update' );

module.exports = ( { knex, redis, prefix } ) => {

  const config = {
    knex,
    prefix,
    redis: promisifyRedis( redis )
  };

  // knex and redis connections should be handled in integrated app
  return {
    set: set.bind( null, config ),
    insert: insert.bind( null, config ),
    update: update.bind( null, config ),
    remove: remove.bind( null, config ),
    batch: batch.bind( null, config )
  };

}
