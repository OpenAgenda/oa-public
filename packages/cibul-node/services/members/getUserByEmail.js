"use strict";

const _ = require( 'lodash' );
const users = require( '@openagenda/users' );

const log = require( '@openagenda/logs' )( 'services/members/getUserByEmail' );

module.exports = async email => {
  log( 'processing', email );

  return users.findOne( {
    query: { email }
  } ).then( u => u && _.pick( u, [ 'id', 'uid', 'fullName' ] ) );
}
