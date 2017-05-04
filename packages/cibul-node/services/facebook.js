"use strict";

const facebook = require( 'facebook' );

module.exports.init = ( config, cb ) => {

  facebook.init( {
    app: config.auth.facebook,
    routes: {
      tabRedirect: config.root + '/facebook/tab/create/:state'
    },
    db: config.db
  }, cb );

}