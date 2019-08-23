"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUserByEmail' );
const usersSvc = require( '../users' );

module.exports = async email => {
  log( 'processing', email );

  return usersSvc.findOne( {
    query: { email }
  } ).then( u => u && _.pick( u, [ 'id', 'uid', 'fullName' ] ) );
}
