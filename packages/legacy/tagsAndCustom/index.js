"use strict";

const logger = require( '@openagenda/logs' );

const set = require( './lib/set' );
const setAll = require( './lib/setAll' );
const utils = {
  generateTagSet: require('./lib/utils/generateTagSet'),
  generateCustomSet: require('./lib/utils/generateCustomSet'),
  generateCategorySet: require('./lib/utils/generateCategorySet')
};

module.exports = ( { knex, queue } ) => {
  return {
    set: set.bind( null, { knex } ),
    setAll: setAll.bind( null, { knex, queue } ),
    task: setAll.task.bind( null, { knex, queue } )
  }
}

module.exports.utils = utils;

module.exports.updateLoggerConfig = config => {
  logger.setModuleConfig( config );
}
