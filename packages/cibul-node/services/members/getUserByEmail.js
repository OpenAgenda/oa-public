"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUserByEmail' );
const usersSvc = require( '../users' );

module.exports = async (email, userOptions) => {
  log( 'processing', email, userOptions );

  return usersSvc.findOne( {
    query: { email },
    ...userOptions
  } ).then( u => u && _.pick( u, ['id', 'uid', 'fullName', 'culture'] ) );
}
