"use strict";

const logger = require( '@openagenda/logs' );

const promisifyRedis = require( './lib/utils/promisifyRedis' );

const batch = require( './lib/batch' );
const batchRemove = require( './lib/batchRemove' );
const insert = require( './lib/insert' );
const memberRemove = require( './lib/memberRemove' );
const memberSet = require( './lib/memberSet' );
const queue = require( './lib/queue' );
const remove = require( './lib/remove' );
const rebuild = require( './lib/rebuild' );
const set = require( './lib/set' );
const task = require( './lib/task' );
const update = require( './lib/update' );

module.exports = ( { knex, redis, prefix } ) => {

  const config = {
    knex,
    prefix,
    redis: promisifyRedis( redis )
  };

  // knex and redis connections should be handled in integrated app
  return {
    rebuild: rebuild.bind( null, config ),
    set: set.bind( null, config ),
    insert: insert.bind( null, config ),
    update: update.bind( null, config ),
    remove: remove.bind( null, config ),
    batch: batch.bind( null, config ),
    batchRemove: batchRemove.bind( null, config ),
    queue: queue.bind( null, config ),
    task: task.bind( null, config ),
    memberSet: memberSet.bind( null, config ),
    memberRemove: memberRemove.bind( null, config )
  };

}

module.exports.updateLoggerConfig = config => {

  logger.setModuleConfig( config );

}
