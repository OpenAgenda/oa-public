"use strict";

const unsubscribed = require( 'unsubscribed' );

module.exports.init = config => {

  unsubscribed.init( {
    mysql: config.db,
    schemas: {
      unsubscribed: config.schemas.unsubscribed
    }
  } );

}