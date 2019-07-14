"use strict";

const logger = require( '@openagenda/logs' );

const set = require( './lib/set' );

module.exports = ( { knex } ) => {

  return {
    set: set.bind( null, { knex } )
  }

}

module.exports.updateLoggerConfig = config => {

  logger.setModuleConfig( config );

}
