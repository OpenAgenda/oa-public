"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUserByEmail' );

module.exports = async (services, email, userOptions) => {
  log( 'processing', email, userOptions );

  return services.users.findOne( {
    query: { email },
    ...userOptions
  } ).then( u => u && _.pick( u, ['id', 'uid', 'fullName', 'culture'] ) );
}
