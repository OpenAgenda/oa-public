"use strict";

const unsubscribed = require( '@openagenda/unsubscribed' );

module.exports.init = config => {

  unsubscribed.init( {
    mysql: config.db,
    schemas: {
      unsubscribed: config.schemas.unsubscribed
    },
    logger: config.getLogConfig( 'svc', 'unsubscribed' )
  } );

}