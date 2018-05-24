"use strict";

const _ = require( 'lodash' );
const logger = require( '@openagenda/logs' );

const config = {
  knex: null
};

module.exports = _.extend( config, {
  init: c => {

    if ( c.logger ) {

      logger.setModuleConfig( c.logger );

    }

    _.extend( config, c );

  }
  //get: () => config
} );