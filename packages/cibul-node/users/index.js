"use strict";

const service = require( '@openagenda/users' );

module.exports = ( parentApp, path ) => {

  const app = service.exposeApp( parentApp, path );

  // Authorisation
  // service().hooks( {} );
};
