"use strict";

const logger = require( '@openagenda/logs' );

const promisifyRedis = require( './lib/utils/promisifyRedis' );

const batch = require( './lib/batch' );
const batchRemove = require( './lib/batchRemove' );
const clear = require( './lib/clear' );
const embedClear = require( './lib/embedClear' );
const insert = require( './lib/insert' );
const locationSet = require( './lib/locationSet' );
const locationRemove = require( './lib/locationRemove' );
const memberRemove = require( './lib/memberRemove' );
const memberSet = require( './lib/memberSet' );
const middleware = require( './lib/middleware' );
const queue = require( './lib/queue' );
const remove = require( './lib/remove' );
const rebuild = require( './lib/rebuild' );
const set = require( './lib/set' );
const setTags = require( './lib/setTags' );
const setCategories = require( './lib/setCategories' );
const task = require( './lib/task' );
const update = require( './lib/update' );

module.exports = ( { knex, redis, prefix, imagePath } ) => {

  const config = {
    knex,
    prefix,
    redis: promisifyRedis( redis )
  };

  // knex and redis connections should be handled in integrated app
  return {
    batch: batch.bind( null, config ),
    batchRemove: batchRemove.bind( null, config ),
    clear: clear.bind( null, config ),
    insert: insert.bind( null, config ),
    memberRemove: memberRemove.bind( null, config ),
    memberSet: memberSet.bind( null, config ),
    locationSet: locationSet.bind( null, config ),
    locationRemove: locationRemove.bind( null, config ),
    middleware: middleware.bind( null, config ),
    embedMiddleware: middleware.embed.bind( null, { knex, redis, prefix, imagePath } ),
    embedClear: embedClear.bind( null, config ),
    queue: queue.bind( null, config ),
    rebuild: rebuild.bind( null, config ),
    remove: remove.bind( null, config ),
    set: set.bind( null, config ),
    setTags: setTags.bind( null, config ),
    setCategories: setCategories.bind( null, config ),
    task: task.bind( null, config ),
    update: update.bind( null, config )
  };

}

module.exports.updateLoggerConfig = config => {

  logger.setModuleConfig( config );

}
