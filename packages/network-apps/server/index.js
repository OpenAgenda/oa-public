"use strict";

const _ = require( 'lodash' );
const logger = require( '@openagenda/logs' );

const name = require( '../package.json' ).name.split( '/' ).pop();

module.exports = _.assign( ( config = {} ) => {

  let eventSchema;

  if ( config.logger ) {
    logger.setModuleConfig( config.logger );
  }

  return _.assign( {
    name,
    config
  }, config.interfaces, {
    getEventSchema: async () => eventSchema ?
      eventSchema :
      eventSchema = await config.interfaces.getEventSchema()
  } );

}, {
  router: require( './router' )
} );
