"use strict";

const logger = require( '@openagenda/logs' );

const promisifyRedis = require( './lib/utils/promisifyRedis' );

const batch = require( './lib/batch' );
const batchRemove = require( './lib/batchRemove' );
const insert = require( './lib/insert' );
const remove = require( './lib/remove' );
const set = require( './lib/set' );
const update = require( './lib/update' );
const queue = require( './lib/queue' );
const task = require( './lib/task' );

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
    batch: batch.bind( null, config ),
    batchRemove: batchRemove.bind( null, config ),
    queue: queue.bind( null, config ),
    task: task.bind( null, config )
  };

}

module.exports.updateLoggerConfig = config => {

  logger.setModuleConfig( config );

}
